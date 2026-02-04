import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SubscribeFormProps {
  translations: {
    placeholder: string;
    button: string;
    submitting: string;
    success: string;
    error: string;
    invalidEmail: string;
  };
  supabaseUrl: string;
}

export function SubscribeForm({ translations, supabaseUrl }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage(translations.invalidEmail);
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(translations.success);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || translations.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage(translations.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={translations.placeholder}
          disabled={status === 'loading'}
          className="flex-1"
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {translations.submitting}
            </>
          ) : (
            translations.button
          )}
        </Button>
      </div>

      {status === 'success' && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
