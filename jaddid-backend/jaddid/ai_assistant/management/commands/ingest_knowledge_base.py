"""Ingest local knowledge-base text files into MongoDB Atlas Vector Search."""

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pymongo import MongoClient


class Command(BaseCommand):
    """Load and embed every text file in the configured knowledge base."""

    help = "Ingest knowledge-base .txt files into MongoDB Atlas Vector Search."

    def handle(self, *args, **options):
        knowledge_base_dir = Path(settings.KNOWLEDGE_BASE_DIR)
        if not knowledge_base_dir.is_dir():
            raise CommandError(
                f"Knowledge-base directory does not exist: {knowledge_base_dir}"
            )

        embeddings = FastEmbedEmbeddings(model_name=settings.EMBEDDING_MODEL)
        client = MongoClient(settings.MONGODB_URI)
        collection = client[settings.MONGODB_DB_NAME][settings.MONGODB_COLLECTION]
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )

        self.stdout.write("Clearing existing knowledge-base chunks...")
        collection.delete_many({})

        total_chunks = 0
        failed_files = 0
        text_files = sorted(knowledge_base_dir.glob("*.txt"))

        for text_file in text_files:
            self.stdout.write(f"Processing {text_file.name}...")
            try:
                documents = TextLoader(str(text_file)).load()
                chunks = splitter.split_documents(documents)
                self.stdout.write(f"Created {len(chunks)} chunks from {text_file.name}.")

                if chunks:
                    MongoDBAtlasVectorSearch.from_documents(
                        documents=chunks,
                        embedding=embeddings,
                        collection=collection,
                        index_name=settings.MONGODB_VECTOR_INDEX_NAME,
                    )
                    total_chunks += len(chunks)
            except Exception as exc:
                failed_files += 1
                self.stderr.write(
                    self.style.ERROR(f"Failed to ingest {text_file.name}: {exc}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Ingestion complete: {total_chunks} chunks ingested "
                f"from {len(text_files) - failed_files} of {len(text_files)} files."
            )
        )
