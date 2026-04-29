import React from 'react';
import { 
    useGetAllCarsQuery, 
    useSendToMaintenanceMutation, 
    useReleaseFromMaintenanceMutation, 
    useUpdateCarLockMutation 
} from '../../Car/redux/carApi.jsx'; 

const FleetManagement = () => {
    const { data: cars = [], isLoading, isError } = useGetAllCarsQuery();
    const [sendToMaintenance] = useSendToMaintenanceMutation();
    const [releaseFromMaintenance] = useReleaseFromMaintenanceMutation();
    const [updateLock] = useUpdateCarLockMutation();

    const handleMaintenance = async (carId, currentStatus) => {
        try {
            // בדיקה האם הרכב זמין (לפי מחרוזת או לפי ה-Enum 0 מה-DB)
            if (currentStatus === 'Available' || currentStatus === 0) {
                await sendToMaintenance(carId).unwrap();
            } else {
                await releaseFromMaintenance(carId).unwrap();
            }
        } catch (err) {
            console.error("Maintenance update failed:", err);
        }
    };

    const handleToggleLock = async (carId, currentLockStatus) => {
        try {
            await updateLock({ id: carId, isLocked: !currentLockStatus }).unwrap();
        } catch (err) {
            console.error("Lock toggle failed:", err);
        }
    };

    if (isLoading) return <div className="loader">טוען רכבים...</div>;
    if (isError) return <div className="error">שגיאה בטעינת הנתונים מהשרת</div>;

    return (
        <div className="admin-section">
            <h3>ניהול צי רכבים - מרכז שליטה</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>רכב</th>
                        <th>דגם</th>
                        <th>סטטוס</th>
                        <th>נעילה</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map(car => (
                        <tr key={car.id}>
                            <td>{car.plateNumber || car.id}</td>
                            <td>{car.model}</td>
                            <td>
                                <span className={`status-badge ${car.status === 'Available' || car.status === 0 ? 'available' : 'repair'}`}>
                                    {car.status === 'Available' || car.status === 0 ? '✅ פעיל' : '🛠️ בטיפול'}
                                </span>
                            </td>
                            <td>
                                <button 
                                    className={`btn-lock ${car.isLocked ? 'locked' : 'unlocked'}`}
                                    onClick={() => handleToggleLock(car.id, car.isLocked)}
                                >
                                    {car.isLocked ? '🔒 נעול' : '🔓 פתוח'}
                                </button>
                            </td>
                            <td>
                                <button 
                                    className={car.status === 'Available' || car.status === 0 ? 'btn-repair' : 'btn-return'}
                                    onClick={() => handleMaintenance(car.id, car.status)}
                                >
                                    {car.status === 'Available' || car.status === 0 ? '🔧 שלח לתיקון' : '✅ החזר לשירות'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FleetManagement;