import { Navigate } from 'react-router-dom';
export default function Rent() {
  return <Navigate to="/properties?purpose=rent" replace />;
}
