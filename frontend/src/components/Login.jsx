import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, Mail, ArrowLeft } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (isForgotPassword) {
      if (!formData.email) {
        const errorMsg = "Please enter your email";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
    } else if (isResetPassword) {
      if (!resetToken || !formData.password) {
        const errorMsg = "Please fill in all fields";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.username || !formData.password) {
        const errorMsg = "Please fill in all fields";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
      if (isSignUp && !formData.email) {
        const errorMsg = "Email is required for sign up";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      let endpoint, body;

      if (isForgotPassword) {
        endpoint = '/api/forgot-password';
        body = { email: formData.email };
      } else if (isResetPassword) {
        endpoint = '/api/reset-password';
        body = { token: resetToken, new_password: formData.password };
      } else {
        endpoint = isSignUp ? '/api/register' : '/api/login';
        body = isSignUp
          ? { username: formData.username, email: formData.email, password: formData.password }
          : { username: formData.username, password: formData.password };
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage('');

        if (isForgotPassword) {
          toast({
            title: "Reset Link Sent!",
            description: data.message || "Check your email for password reset instructions.",
          });
          // Show the token in the UI (for demo purposes)
          if (data.token) {
            setResetToken(data.token);
            setIsForgotPassword(false);
            setIsResetPassword(true);
            toast({
              title: "Reset Token Generated",
              description: "Token has been auto-filled. Enter your new password.",
              duration: 5000,
            });
          }
        } else if (isResetPassword) {
          toast({
            title: "Password Reset!",
            description: "Your password has been reset successfully. Please login.",
          });
          setIsResetPassword(false);
          setResetToken('');
          setFormData({ username: '', email: '', password: '' });
        } else if (isSignUp) {
          toast({
            title: "Account Created!",
            description: "Your account has been created successfully. Please login.",
          });
          setIsSignUp(false);
          setFormData({ username: '', email: '', password: '' });
        } else {
          login(data.user, data.access_token);
          toast({
            title: "Login Successful!",
            description: `Welcome back, ${data.user.username}!`,
          });
          if (onLogin) {
            onLogin(data.user, data.access_token);
          }
        }
      } else {
        const errorMsg = data.detail || data.message || "Operation failed";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.message || "Failed to connect to server. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Reset Password';
    if (isResetPassword) return 'Set New Password';
    if (isSignUp) return 'Create Account';
    return 'Welcome Back';
  };

  const getSubtitle = () => {
    if (isForgotPassword) return 'Enter your email to receive reset instructions';
    if (isResetPassword) return 'Enter your new password';
    if (isSignUp) return 'Create your account to get started';
    return 'Sign in to your account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1601598851547-4302969d0614?w=100&h=100&fit=crop&crop=center"
                alt="GroziOne Logo"
                className="h-8 w-8 object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            {getTitle()}
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {getSubtitle()}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Username Field - Show for login and signup */}
            {!isForgotPassword && !isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Email Field - Show for signup and forgot password */}
            {(isSignUp || isForgotPassword) && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Reset Token Field - Show for reset password */}
            {isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="resetToken">Reset Token</Label>
                <Input
                  id="resetToken"
                  type="text"
                  placeholder="Enter reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Password Field - Show for all except forgot password */}
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isResetPassword ? 'New Password' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={isResetPassword ? "Enter new password" : "Enter your password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isForgotPassword ? 'Send Reset Link' : isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {/* Forgot Password Link - Show only on login */}
            {!isSignUp && !isForgotPassword && !isResetPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setFormData({ username: '', email: '', password: '' });
                  setErrorMessage('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium block w-full"
              >
                Forgot your password?
              </button>
            )}

            {/* Back to Login - Show on forgot/reset password */}
            {(isForgotPassword || isResetPassword) && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsResetPassword(false);
                  setResetToken('');
                  setFormData({ username: '', email: '', password: '' });
                  setErrorMessage('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </button>
            )}

            {/* Sign Up / Sign In Toggle - Show only on login/signup */}
            {!isForgotPassword && !isResetPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormData({ username: '', email: '', password: '' });
                  setErrorMessage('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium block w-full"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
