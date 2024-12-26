import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { useTranslation } from 'adminjs';

const CustomDashboard = () => {
  const { translate } = useTranslation();
  const [data, setData] = useState(null);
  const api = new ApiClient();

  useEffect(() => {
    // Gọi API để lấy dữ liệu dashboard
    api.getDashboard()
      .then((response) => {
        console.log("Dashboard data:", response);  // Kiểm tra dữ liệu trả về
        setData(response.data);  // Lưu dữ liệu vào state
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);  // Kiểm tra lỗi nếu có
      });
  }, []);

  return (
    <div>
      <h1>{translate('dashboard.welcome')}</h1>
      {data ? (
        <p>{data.message}</p>  // Hiển thị dữ liệu nếu có
      ) : (
        <p>Loading data...</p>  // Thông báo khi chưa có dữ liệu
      )}
    </div>
  );
};

export default CustomDashboard;
