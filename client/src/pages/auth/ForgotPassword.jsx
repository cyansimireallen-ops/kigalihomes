import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Placeholder flow — wire this up to a real email/OTP service later.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success('If that email exists, a reset link will be sent.');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl text-charcoal">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Enter your email and we'll send you a link to reset your password.
      </p>
      {sent ? (
        <p className="mt-6 rounded-lg bg-forest-50 px-4 py-3 text-sm text-forest-700">
          Check your inbox for further instructions. (This is a placeholder — connect an email service to enable it.)
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="font-medium text-forest-700 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
