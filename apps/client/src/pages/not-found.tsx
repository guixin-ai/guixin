import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-9xl font-bold text-gray-800">404</div>
      <div className="text-2xl text-gray-600 mt-4 mb-8">页面未找到</div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Home size={20} />
        <span>返回首页</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
