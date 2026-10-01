import { Navigate, useLocation } from 'react-router-dom';

/** Legacy route — browse lives on `/` with the same query params. */
export default function ListingsPage() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
}
