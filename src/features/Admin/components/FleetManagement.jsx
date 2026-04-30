import React, { useMemo } from 'react';
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
            if (currentStatus === 'Available' || currentStatus === 0) {
                await sendToMaintenance(carId).unwrap();
            } else {
                await releaseFromMaintenance(carId).unwrap();
            }
        } catch (err) {
            console.error('Maintenance update failed:', err);
        }
    };

    const handleToggleLock = async (carId, currentLockStatus) => {
        try {
            await updateLock({ id: carId, isLocked: !currentLockStatus }).unwrap();
        } catch (err) {
            console.error('Lock toggle failed:', err);
        }
    };

    const summary = useMemo(() => {
        const active = cars.filter(car => car.status === 'Available' || car.status === 0).length;
        const maintenance = cars.filter(car => !(car.status === 'Available' || car.status === 0)).length;
        const lowFuel = cars.filter(car => car.fuelLevel !== undefined && Number(car.fuelLevel) < 30).length;
        return { active, maintenance, lowFuel };
    }, [cars]);

    if (isLoading) return <div className="admin-loading">טוען רכבים...</div>;
    if (isError) return <div className="admin-error">שגיאה בטעינת הנתונים מהשרת</div>;

    return (
        <div className="admin-section admin-page">
            <div className="page-hero-bar">
                <div>
                    <h3>ניהול צי רכבים</h3>
                    <p>הצגת סטטוס מלא של כל הרכבים וצפייה ברכבים עם דלק נמוך.</p>
                </div>
                <div className="page-hero-metrics">
                    <span>פעילים: {summary.active}</span>
                    <span>בתיקון: {summary.maintenance}</span>
                    <span>דלק נמוך: {summary.lowFuel}</span>
                </div>
            </div>
            <table className="admin-table admin-table-purple">
                <thead>
                    <tr>
                        <th>רכב</th>
                        <th>דגם</th>
                        <th>דלק</th>
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
                                <span className={`status-badge ${car.fuelLevel >= 40 ? 'available' : car.fuelLevel >= 15 ? 'status-warning' : 'repair'}`}>
                                    {car.fuelLevel !== undefined ? `${car.fuelLevel}%` : 'לא ידוע'}
                                </span>
                            </td>
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
                                    className={`btn-action ${car.status === 'Available' || car.status === 0 ? 'btn-repair' : 'btn-return'}`}
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