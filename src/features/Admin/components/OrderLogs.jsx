import { useGetAllOrdersQuery } from '../../Order/redux/orderApi.jsx';
import '../Style/AdminDashboard.css';
const OrderLogs = () => {
    const { data: orders = [], isLoading } = useGetAllOrdersQuery();

    if (isLoading) return <div>טוען יומן הזמנות...</div>;

    return (
        <div className="admin-section">
            <h3>יומן הזמנות אחרונות</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>מס' הזמנה</th>
                        <th>לקוח</th>
                        <th>רכב</th>
                        <th>תאריך התחלה</th>
                        <th>סטטוס</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.slice(0, 10).map(order => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.userEmail}</td>
                            <td>{order.carPlateNumber}</td>
                            <td>{new Date(order.startTime).toLocaleDateString('he-IL')}</td>
                            <td>
                                <span className={`status-badge ${order.isPaid ? 'available' : 'repair'}`}>
                                    {order.isPaid ? 'שולם' : 'ממתין לתשלום'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};