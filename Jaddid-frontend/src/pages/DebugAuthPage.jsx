import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugAuthPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  
  const checkLocalStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('=== Auth Debug Info ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Token from context:', token);
    console.log('Token from localStorage:', storedToken);
    console.log('User from context:', user);
    console.log('User from localStorage:', storedUser);
    console.log('Token starts with:', storedToken?.substring(0, 20));
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}
          </div>
          <div>
            <strong>Token:</strong> {token ? `${token.substring(0, 30)}...` : 'None'}
          </div>
          <div>
            <strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </div>
          <Button onClick={checkLocalStorage}>
            Log Full Debug Info to Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuthPage;
