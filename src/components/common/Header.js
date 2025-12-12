import { useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Onopenmodalsetting } from '../../Redux/Actions/Action';
import { Link, useLocation } from 'react-router-dom';
import { fetchProfile } from '../../Redux/Reducers/ProfileReducer';
// import astroLogo from '../../assets/images/astro-logo.svg';

function Header(props) {
    const location = useLocation();
    const dispatch = useDispatch();

    const userData = JSON.parse(localStorage.getItem("student-admin-data"));
    const Profile = useSelector((state) => state?.ProfileReducer?.profile);

    useEffect(() => {
        if (location?.pathname === "/profile-pages") {
            dispatch(fetchProfile(userData?._id));
        }
    }, [dispatch]);

    // ✅ Logout handler
    const handleLogout = () => {
        localStorage.removeItem("student-admin-data");
        localStorage.removeItem("student-admin-token");
        window.location.href = process.env.PUBLIC_URL + "/sign-in";
    };

    return (
        <div className="header">
            <nav className="navbar">
                <div className="container-xxl">
                     <Link to="/dashboard">
                    <div><img src={''} alt="User Admin" style={{height: "30px"}} /></div></Link>
                    <div className="d-flex align-items-center ms-auto gap-2">

                        {/* ⚙️ Settings Button */}
                        <button
                            type="button"
                            className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                            style={{ width: "34px", height: "34px" }}
                            onClick={() => props.Onopenmodalsetting(true)}
                        >
                            <i className="icofont-gear-alt fs-6"></i>
                        </button>

                        {/* Signout Button */}
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm btn-primary d-flex align-items-center"
                            style={{ gap: "6px" }}
                        >
                            <i className="icofont-logout fs-6"></i>
                            Sign Out
                        </button>

                    </div>


                    {/* ☰ Sidebar Toggle */}
                    <button
                        className="navbar-toggler p-0 border-0 menu-toggle order-3 ms-2"
                        style={{ width: "34px", height: "34px" }}
                        type="button"
                        onClick={() => {
                            const sidebar = document.getElementById('mainsidemenu');
                            const overlay = document.getElementById('sidebar-overlay');
                            if (sidebar) {
                                sidebar.classList.toggle('open');
                                // Toggle overlay
                                if (overlay) {
                                    if (sidebar.classList.contains('open')) {
                                        overlay.classList.add('active');
                                    } else {
                                        overlay.classList.remove('active');
                                    }
                                }
                            }
                        }}
                    >
                        <span className="fa fa-bars"></span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

const mapStateToProps = ({ Mainreducer }) => ({
    Mainreducer
});

export default connect(mapStateToProps, {
    Onopenmodalsetting
})(Header);
