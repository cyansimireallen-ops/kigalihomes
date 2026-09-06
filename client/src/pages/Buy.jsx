import { Navigate } from 'react-router-dom';
export default function Buy() {
  return <Navigate to="/properties?purpose=sale" replace />;
}
