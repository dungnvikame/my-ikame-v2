import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatusPage: React.FC<{ code: 403 | 404 }> = ({ code }) => {
  const { lens } = useApp();
  const homeRoute = lens === 'manager' ? '/manager/overview' : lens === 'com_admin' ? '/admin' : '/home';

  return (
    <div className="card empty-state" style={{ maxWidth: 480, margin: '40px auto', padding: '44px 28px' }}>
      <div className="empty-state-icon" style={{ width: 52, height: 52 }}>
        {code === 403 ? <ShieldAlert size={24} /> : <Compass size={24} />}
      </div>
      <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary-fg)', marginBottom: 4 }}>
        HTTP {code}
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
        {code === 403 ? 'Bạn không có quyền truy cập trang này' : 'Không tìm thấy trang bạn yêu cầu'}
      </h1>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
        {code === 403
          ? 'Tài nguyên này thuộc lăng kính hoặc vai trò HRIS khác. Hãy quay về trang chủ lăng kính của bạn.'
          : 'Đường dẫn có thể đã thay đổi hoặc không tồn tại trong hệ thống My iKame.'}
      </p>
      <Link to={homeRoute} className="btn btn-primary">
        Về trang chủ của bạn
      </Link>
    </div>
  );
};
