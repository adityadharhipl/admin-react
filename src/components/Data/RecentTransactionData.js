import Product3 from '../../assets/images/product/product-3.jpg';
import Product2 from '../../assets/images/product/product-2.jpg';
import Product1 from '../../assets/images/product/product-1.jpg';
import Product4 from '../../assets/images/product/product-4.jpg';

export const RecentTransactionData = {
   
    columns: [
        {
            name: "User Profile",
            selector: (row) => row.name,
            cell: row => <><img className="avatar rounded lg" src={row.image} alt="" /> <span className="px-2">{row.name}</span></>,
            sortable: true, minWidth: "250px"
        },
        {
            name: "Email",
            selector: (row) => row.customerName,
            sortable: true,
            
        },
        {
            name: "Phone Number",
            selector: (row) => row.bankCard,
            sortable: true
        },
        {
            name: "STATUS",
            selector: (row) => row.status,
            sortable: true,
            cell: row => <span className={`badge ${row.status === "Complited" ? 'bg-success' : "bg-warning"}`}>{row.status}</span>
        },

    ],
    rows: [
        {
            image: Product3,
            name: "Jhon Doe",
            customerName: "user@gmail.com",
            bankCard: "7891023456",
            status: "Online"
        },
        {
            image: Product2,
            name: "Jhon Doe",
            customerName: "user@gmail.com",
            bankCard: "7891023456",
            status: "Active"
        },
        {
            image: Product1,
            name: "Jhon Doe",
            customerName: "user@gmail.com",
            bankCard: "7891023456",
            status: "Inactive"
        },
        {
            image: Product4,
            name: "Jhon Doe",
            customerName: "user@gmail.com",
            bankCard: "7891023456",
            status: "Online"
        },
        {
            image: Product3,
            name: "Jhon Doe",
            customerName: "user@gmail.com",
            bankCard: "7891023456",
            status: "Online"
        },
    ]
}
