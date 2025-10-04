import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { getUserFriendlyError } from '@/lib/errorMessages'; // Import the error mapping

export const LoginForm = () => {
  const [email, setEmail] = useState('demo@rhymerivals.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password);
      
      // Store auth token AND user info
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userInfo', JSON.stringify(response.user));
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${response.user.mc_name}`,
      });
      
      navigate('/dashboard');
    } catch (err) {
      // Use the error mapping function to get user-friendly messages
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Set guest mode flag
    localStorage.setItem('authToken', 'guest');
    localStorage.setItem('userInfo', JSON.stringify({
      mc_name: 'Guest',
      email: 'guest@battleapp.com',
      id: 'guest'
    }));
    
    toast({
      title: "Entered as Guest",
      description: "Browse battles without an account",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      
      <Card className="w-full max-w-md electric-border animate-slide-up relative z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold neon-text">Welcome Back</CardTitle>
          <CardDescription>
            Enter the battle arena and showcase your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mc@rhymerivals.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="electric-border"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-glow">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your secret bars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="electric-border"
              />
            </div>

            <Button
              type="submit"
              variant="battle"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entering Arena...' : 'LOGIN'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mt-3 border-secondary text-secondary hover:bg-secondary/10"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            New to the scene?{' '}
            <Link to="/register" className="text-primary hover:text-primary-glow underline">
              Join the battle
            </Link>
          </div>
          
          <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs text-muted-foreground">
            <strong>Demo credentials:</strong><br />
            Email: demo@rhymerivals.com<br />
            Password: demo123
          </div>
        </CardContent>
      </Card>
    </div>
  );
};