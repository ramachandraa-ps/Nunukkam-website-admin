import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 hover:text-primary-700 cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                return (
                    <React.Fragment key={name}>
                        <span className="text-gray-300">/</span>
                        <span
                            className={`${isLast ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-primary-700 cursor-pointer'}`}
                            onClick={() => !isLast && navigate(routeTo)}
                        >
                            {formattedName}
                        </span>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Breadcrumbs;
