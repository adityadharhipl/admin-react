import React, { useEffect, useState } from 'react';
import { Route, Routes as ReactRoutes, Navigate } from "react-router-dom";
// --- Import all your components ---
import Dashboard from './Dashboard/Dashboard';
import Header from '../components/common/Header';
import ScrollToTop from '../components/common/ScrollToTop';
import CouponsList from './Coupons/CouponsList';
import CouponsAdd from './Coupons/CouponsAdd';
import CouponsEdit from './Coupons/CouponsEdit';
import StaterPage from './Stater Page/StaterPage';
import TeamStaffList from './Users/UsersList';
import TeamStaffAdd from './Users/UsersAdd';
import AddFAQ from './FAQ/AddFAQ';
import FAQList from './FAQ/FAQList';
import ExpertiseAdd from './Expertise/ExpertiseAdd';
import ExpertiseEdit from './Expertise/ExpertiseEdit';
import ExpertiseList from './Expertise/ExpertiseList';
import HeatMapBox from './HeatMap/HeatMapBox';
import { PrivacyPolicy } from './PrivacyPolicy/PrivacyPolicy';
import AstrologerList from './Astrologer/AstrologerList';
import AstrologerAdd from './Astrologer/AstrologerAdd';
import AstoReqView from './Astrologer/AstoReqView';
import AstrologerView from './Astrologer/AstrologerView';
import AstrolgerBooking from './Astrologer/AstrolgerBooking';
import OnlineStatus from './Astrologer/OnlineStatus';
import AIAstrologerList from './AIAstrologer/AIAstrologerList';
import AIAstrologerAdd from '../components/AIAstrologer/AIAstrologerAdd';
import AIAstrologerView from './AIAstrologer/AIAstrologerView';
import BookingAdd from './Booking/BookingAdd';
import BookingDetails from './Booking/BookingDetails';
import BookingEdit from './Booking/BookingEdit';
import BookingList from './Booking/BookingList';
import ChatHistory from './Booking/ChatHistory';
import LanguageAdd from './Language/LanguageAdd';
import LanguageList from './Language/LanguageList';
import { TermsAndCondition } from './TermsAndConditions/TermsAndCondition';
import { AboutUs } from './AboutUs/AboutUsScreens';
import RefundPolicy from './RefundPolicy/RefundPolicy';
import SupportQuery from './Support/SupportQuery';
import SupportQueryView from './Support/SupportQueryView';
import EductionCouponList from './EductionCoupon/EductionCouponList';
import EducationCouponAdd from './EductionCoupon/EducationCouponAdd';
import ListGooglePayCoupon from './GooglePayCoupon/ListGooglePayCoupon';
import AddGooglePayCoupon from './GooglePayCoupon/AddGooglePayCoupon';
import ViewGoogleCopon from './GooglePayCoupon/ViewGoogleCopon';
import ListOffer from './OfferModules/Listoffer';
import AddOffer from './OfferModules/AddOffer';
import ListGeneric from './GenericFaq/ListGeneric';
import AddReferEarnFAQs from './ReferEarnFAQs/AddReferEarnFAQs';
import ListReferEarnFAQs from './ReferEarnFAQs/ListReferEarnFAQs';
import AddGeneric from './GenericFaq/AddGeneric';
import ListReview from './GenericReview/ListReview';
import AddReview from './GenericReview/AddReview';
import ListConsultationCoupon from './ConsultationCoupon/ListConsultationCoupon';
import AddConsultationCoupon from './ConsultationCoupon/AddConsultationCoupon';
import UserFeedbackList from './UserFeedBack/userfeedbackList';
import AstrologerSupportList from './AstrologerSupport/AstrologerSupportList';
import AstroSupportDetails from './AstrologerSupportDetails/AstroSupportDetails';
import AstroSupportView from './AstrologerSupportDetails/AstroSupportView';
import ConsultationList from './ConsultationVoucher/ConsultationList';
import ConsultationAdd from './ConsultationVoucher/ConsultationAdd';
import Notification from './Notification/Notification';
import AstroSupportChat from './AstrologerSupport/AstroSupportChat';
import UserMessageView from './UserFeedBack/UserMessageView';
import FeedbackCallbackList from './CallbackRequests/FeedbackCallbackList';
import DailyRechargeReport from './Reports/DailyRechargeReports';
import InvoiceReportList from './Reports/InVoiceReports';
import SessionReports from './Reports/SessionReport';
import CouponUsesReport from './Reports/CouponUsesReport';
import CreditReports from './Reports/CreditReports';
import PayoutReports from './Reports/PayoutReports';
import PayoutReportView from './Reports/PayoutReportView';
import AstrologerStatusByTimeRange from './Reports/AstrologerStatusByTimeRange';
import UserBookings from './Users/UserBookings';
import AstroList from './AstroTag/AstroList';
import AstroTag from './AstroTag/AstroTag';
import UserSupportList from './UserSupport/UserSupportList';
import UserSupportChat from './UserSupport/UserSupportChat';
import UserRole from './RoleAndUser/User/UserRole';
import AddRole from './RoleAndUser/Role/AddRole';
import RoleAndUserManagment from './RoleAndUser/Role/RoleAndUserManagment';
import AddUserrole from './RoleAndUser/User/AddUserrole';
import TopBanner from './BannerManagment/TopBanner/TopBanner';
import ConsultationType from './BannerManagment/ConsultationType/ConsultationType';
import ServicesType from './BannerManagment/ServicesType/ServicesType';
import ForceUpdate from './ForceUpdate/forceUpdate';
import OnboardingImages from './BannerManagment/OnboardingImages/OnboardingImages';
import AdvertisementBanner from './CMS/AdvertisementBanner/AdvertisementBanner';

// =========================================================================
// THE FIX: Add a `category` property to every route and export `allRoutes`
// The `category` should match the keys in your `privilegeLabelMap`
// =========================================================================
export const allRoutes = [
    // === Dashboard ===
    { path: "/dashboard", Component: Dashboard, requiredPrivilege: "/dashboard", category: "/dashboard" },
    { path: '/stater-page', Component: StaterPage, requiredPrivilege: '/stater-page', category: "/dashboard" },

    // === App Management ===
    { path: '/force-update', Component: ForceUpdate, requiredPrivilege: '/force-update', category: '/app-management' },

    // === Student Management ===
    { path: '/student-list', Component: AstrologerList, requiredPrivilege: '/student-list', category: '/student-management' },
    { path: '/student-add', Component: AstrologerAdd, requiredPrivilege: '/student-add', category: '/student-management' },
    { path: '/student-edit/:id', Component: AstrologerAdd, requiredPrivilege: '/student-edit/:id', category: '/student-management' },
    { path: '/student-view/:id', Component: AstrologerView, requiredPrivilege: '/student-view/:id', category: '/student-management' },
    { path: '/student-req-view/:id', Component: AstoReqView, requiredPrivilege: '/student-req-view/:id', category: '/student-management' },
    { path: '/booking-by-student/:studentID', Component: AstrolgerBooking, requiredPrivilege: '/booking-by-student/:studentID', category: '/student-management' },
    { path: '/student-online-status/:id', Component: OnlineStatus, requiredPrivilege: '/student-online-status/:id', category: '/student-management' },
    { path: '/student-tag-management', Component: AstroList, requiredPrivilege: '/student-tag-management', category: '/student-management' },
    { path: '/tag-add', Component: AstroTag, requiredPrivilege: '/tag-add', category: '/student-management' },
    { path: '/tag-edit/:id', Component: AstroTag, requiredPrivilege: '/tag-edit/:id', category: '/student-management' },
    { path: '/expertise-list', Component: ExpertiseList, requiredPrivilege: '/expertise-list', category: '/student-management' },
    { path: '/expertise-add', Component: ExpertiseAdd, requiredPrivilege: '/expertise-add', category: '/student-management' },
    { path: '/expertise-edit/:id', Component: ExpertiseAdd, requiredPrivilege: '/expertise-edit/:id', category: '/student-management' },

    // === Student Support & Operations ===
    { path: '/student-reviews', Component: ListReview, requiredPrivilege: '/student-reviews', category: '/student-support-operations' },
    { path: '/student-reviews-add', Component: AddReview, requiredPrivilege: '/student-reviews-add', category: '/student-support-operations' },
    { path: '/review-edit/:id', Component: AddReview, requiredPrivilege: '/review-edit/:id', category: '/student-support-operations' },
    { path: '/student-support', Component: AstrologerSupportList, requiredPrivilege: '/student-support', category: '/student-support-operations' },
    { path: '/student-support-ticket', Component: AstroSupportDetails, requiredPrivilege: '/student-support-ticket', category: '/student-support-operations' },
    { path: '/StudentView-detail/:id', Component: AstroSupportView, requiredPrivilege: '/StudentView-detail/:id', category: '/student-support-operations' },
    { path: '/StudentSupportChat/:id', Component: AstroSupportChat, requiredPrivilege: '/StudentSupportChat/:id', category: '/student-support-operations' },

    // === User Support & Operations ===
    { path: '/user-feedback', Component: UserFeedbackList, requiredPrivilege: '/user-feedback', category: '/user-support-operations' },
    { path: '/MessageView-detail/:id', Component: UserMessageView, requiredPrivilege: '/MessageView-detail/:id', category: '/user-support-operations' },
    { path: '/user-support', Component: UserSupportList, requiredPrivilege: '/user-support', category: '/user-support-operations' },
    { path: '/user-chat/:id', Component: UserSupportChat, requiredPrivilege: '/user-chat/:id', category: '/user-support-operations' },
    { path: '/support-query', Component: SupportQuery, requiredPrivilege: '/support-query', category: '/user-support-operations' },
    { path: '/support-query-view/:id', Component: SupportQueryView, requiredPrivilege: '/support-query-view/:id', category: '/user-support-operations' },
    { path: '/callback-requests', Component: FeedbackCallbackList, requiredPrivilege: '/callback-requests', category: '/user-support-operations' },

    // === Product Management ===
    { path: '/ai-tutor-list', Component: AIAstrologerList, requiredPrivilege: '/ai-tutor-list', category: '/product-management' },
    { path: '/ai-tutor-add', Component: AIAstrologerAdd, requiredPrivilege: '/ai-tutor-add', category: '/product-management' },
    { path: '/ai-tutor-edit/:id', Component: AIAstrologerAdd, requiredPrivilege: '/ai-tutor-edit/:id', category: '/product-management' },
    { path: '/ai-tutor-view/:id', Component: AIAstrologerView, requiredPrivilege: '/ai-tutor-view/:id', category: '/product-management' },
    { path: '/language-list', Component: LanguageList, requiredPrivilege: '/language-list', category: '/product-management' },
    { path: '/language-add', Component: LanguageAdd, requiredPrivilege: '/language-add', category: '/product-management' },
    { path: '/language-edit/:id', Component: LanguageAdd, requiredPrivilege: '/language-edit/:id', category: '/product-management' },
    { path: '/notification-list', Component: Notification, requiredPrivilege: '/notification-list', category: '/product-management' },

    // === Admin ===
    { path: '/role-management', Component: RoleAndUserManagment, requiredPrivilege: '/role-management', category: '/admin' },
    { path: '/addrole', Component: AddRole, requiredPrivilege: '/addrole', category: '/admin' },
    { path: '/useree/:id', Component: AddRole, requiredPrivilege: '/useree/:id', category: '/admin' },
    { path: '/user-management', Component: UserRole, requiredPrivilege: '/user-management', category: '/admin' },
    { path: '/user-role-add', Component: AddUserrole, requiredPrivilege: '/user-role-add', category: '/admin' },
    { path: '/user-role-edit/:id', Component: AddUserrole, requiredPrivilege: '/user-role-edit/:id', category: '/admin' },

    // === CMS (This is a large category, group sub-modules under it) ===
    { path: '/users-list', Component: TeamStaffList, requiredPrivilege: '/users-list', category: '/cms' },
    { path: '/users-add', Component: TeamStaffAdd, requiredPrivilege: '/users-add', category: '/cms' },
    { path: '/users-edit/:id', Component: TeamStaffAdd, requiredPrivilege: '/users-edit/:id', category: '/cms' },
    { path: '/booking-by-user/:userId', Component: UserBookings, requiredPrivilege: '/booking-by-user/:userId', category: '/cms' },
    { path: '/booking-list', Component: BookingList, requiredPrivilege: '/booking-list', category: '/cms' },
    { path: '/booking-add', Component: BookingAdd, requiredPrivilege: '/booking-add', category: '/cms' },
    { path: '/booking-edit/:id', Component: BookingEdit, requiredPrivilege: '/booking-edit/:id', category: '/cms' },
    { path: '/booking-details/:id', Component: BookingDetails, requiredPrivilege: '/booking-details/:id', category: '/cms' },
    { path: '/chat-history/:userId/:astroId', Component: ChatHistory, requiredPrivilege: '/chat-history/:userId/:astroId', category: '/cms' },
    { path: '/coupons-list', Component: CouponsList, requiredPrivilege: '/coupons-list', category: '/cms' },
    { path: '/coupons-add', Component: CouponsAdd, requiredPrivilege: '/coupons-add', category: '/cms' },
    { path: '/coupons-edit/:id', Component: CouponsEdit, requiredPrivilege: '/coupons-edit/:id', category: '/cms' },
    { path: '/eduction-modulecoupon', Component: EductionCouponList, requiredPrivilege: '/eduction-modulecoupon', category: '/cms' },
    { path: '/educationcoupon-add', Component: EducationCouponAdd, requiredPrivilege: '/educationcoupon-add', category: '/cms' },
    { path: '/consultation-coupon', Component: ListConsultationCoupon, requiredPrivilege: '/consultation-coupon', category: '/cms' },
    { path: '/consultation-add', Component: AddConsultationCoupon, requiredPrivilege: '/consultation-add', category: '/cms' },
    { path: '/googlepay-coupon', Component: ListGooglePayCoupon, requiredPrivilege: '/googlepay-coupon', category: '/cms' },
    { path: '/googlepaycoupon-add', Component: AddGooglePayCoupon, requiredPrivilege: '/googlepaycoupon-add', category: '/cms' },
    { path: '/google-view/:id', Component: ViewGoogleCopon, requiredPrivilege: '/google-view/:id', category: '/cms' },
    { path: '/consultation-voucher', Component: ConsultationList, requiredPrivilege: '/consultation-voucher', category: '/cms' },
    { path: '/consultationvoucher-add', Component: ConsultationAdd, requiredPrivilege: '/consultationvoucher-add', category: '/cms' },
    { path: '/Concoupons-edit/:id', Component: ConsultationAdd, requiredPrivilege: '/Concoupons-edit/:id', category: '/cms' },
    { path: '/offer-list', Component: ListOffer, requiredPrivilege: '/offer-list', category: '/cms' },
    { path: '/offer-add', Component: AddOffer, requiredPrivilege: '/offer-add', category: '/cms' },
    { path: '/offer-edit/:id', Component: AddOffer, requiredPrivilege: '/offer-edit/:id', category: '/cms' },
    { path: '/top-banners', Component: TopBanner, requiredPrivilege: '/top-banners', category: '/cms' },
    { path: '/onboarding-images', Component: OnboardingImages, requiredPrivilege: '/onboarding-images', category: '/cms' },
    { path: '/consultation-type', Component: ConsultationType, requiredPrivilege: '/consultation-type', category: '/cms' },
    { path: '/service-banners', Component: ServicesType, requiredPrivilege: '/service-banners', category: '/cms' },
    { path: '/course-specificfaq', Component: FAQList, requiredPrivilege: '/course-specificfaq', category: '/cms' },
    { path: '/faq-add', Component: AddFAQ, requiredPrivilege: '/faq-add', category: '/cms' },
    { path: '/faq-edit/:id', Component: AddFAQ, requiredPrivilege: '/faq-edit/:id', category: '/cms' },
    { path: '/generic-faq', Component: ListGeneric, requiredPrivilege: '/generic-faq', category: '/cms' },
    { path: '/generic-add', Component: AddGeneric, requiredPrivilege: '/generic-add', category: '/cms' },
    { path: '/faqger-edit/:id', Component: AddGeneric, requiredPrivilege: '/faqger-edit/:id', category: '/cms' },
    { path: '/refer-faq', Component: ListReferEarnFAQs, requiredPrivilege: '/refer-faq', category: '/cms' },
    { path: '/referadd', Component: AddReferEarnFAQs, requiredPrivilege: '/referadd', category: '/cms' },
    { path: '/referadd/:id', Component: AddReferEarnFAQs, requiredPrivilege: '/referadd/:id', category: '/cms' },
    { path: '/privacy-policy', Component: PrivacyPolicy, requiredPrivilege: '/privacy-policy', category: '/cms' },
    { path: '/terms-conditions', Component: TermsAndCondition, requiredPrivilege: '/terms-conditions', category: '/cms' },
    { path: '/about-us', Component: AboutUs, requiredPrivilege: '/about-us', category: '/cms' },
    { path: '/refund-policy', Component: RefundPolicy, requiredPrivilege: '/refund-policy', category: '/cms' },
    // { path: '/trending-consultations', Component: TrendingConsultations, requiredPrivilege: '/trending-consultations', category: '/cms' },
    { path: '/advertisement-banner', Component: AdvertisementBanner, requiredPrivilege: '/advertisement-banner', category: '/cms' },

    // === Reports ===
    { path: '/daily-recharge', Component: DailyRechargeReport, requiredPrivilege: '/daily-recharge', category: '/reports' },
    { path: '/invoice-reports', Component: InvoiceReportList, requiredPrivilege: '/invoice-reports', category: '/reports' },
    { path: '/session-reports', Component: SessionReports, requiredPrivilege: '/session-reports', category: '/reports' },
    { path: '/coupon-usesreport', Component: CouponUsesReport, requiredPrivilege: '/coupon-usesreport', category: '/reports' },
    { path: '/credit-reports', Component: CreditReports, requiredPrivilege: '/credit-reports', category: '/reports' },
    { path: '/payout-reports', Component: PayoutReports, requiredPrivilege: '/payout-reports', category: '/reports' },
    { path: '/payout-reportsView/:id', Component: PayoutReportView, requiredPrivilege: '/payout-view/:id', category: '/reports' },
    { path: '/student-status-time-range', Component: AstrologerStatusByTimeRange, requiredPrivilege: '/student-status-time-range', category: '/reports' },
    { path: '/heat-map', Component: HeatMapBox, requiredPrivilege: '/heat-map', category: '/reports' },
];

// =========================================================================
// NO CHANGES BELOW THIS LINE IN THIS FILE
// =========================================================================
const getUserPrivileges = () => {
    // Removed privilege check, always return super admin
    return ['SUPER_ADMIN'];
};

const PrivateRoute = ({ children, requiredPrivilege, userPrivileges }) => {
    // Removed privilege check to allow all access
    return children;
};

const Unauthorized = () => (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '60vh' }}>
        <div className='text-center'>
            <h2 className='text-danger'>403 - Access Denied</h2>
            <p className='text-muted'>You do not have the required permissions to view this page.</p>
        </div>
    </div>
);

const LoadingScreen = () => (
    <div className='d-flex justify-content-center align-items-center vh-100'>
        <h2>Loading...</h2>
    </div>
);

function MainIndex(props) {
    const { activekey } = props;
    const [privileges, setPrivileges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userPrivs = getUserPrivileges();
        setPrivileges(userPrivs);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    // const userToken = localStorage.getItem("student-admin-token");
    // if (!userToken) {
    //     return <Navigate to={process.env.PUBLIC_URL + "/sign-in"} />;
    // }
const handleSignIn = () => {
    // Mock login: set a dummy token & privileges
    localStorage.setItem("student-admin-token", "dummy-token");
    localStorage.setItem("student-admin-data", JSON.stringify({
        role: { privileges: ["*"] },  // SUPER_ADMIN privileges
        name: "Test User"
    }));

    // Redirect to dashboard
    window.location.href = process.env.PUBLIC_URL + "/dashboard";
};

    const isSuperAdmin = privileges.includes('SUPER_ADMIN');

    return (
        <div className='main px-lg-4 px-md-4'>
            {activekey === "/chat" ? "" : <Header />}
            <div className="body d-flex py-3">
                <ReactRoutes>
                    <Route path={process.env.PUBLIC_URL + "/"} element={<Navigate to={`${process.env.PUBLIC_URL}/dashboard`} />} />
                    <Route path={process.env.PUBLIC_URL + "/unauthorized"} element={<Unauthorized />} />

                    {allRoutes.map(({ path, Component, requiredPrivilege }) => (
                        <Route
                            key={path}
                            path={process.env.PUBLIC_URL + path}
                            element={
                                <PrivateRoute userPrivileges={privileges} requiredPrivilege={requiredPrivilege}>
                                    <Component />
                                </PrivateRoute>
                            }
                        />
                    ))}

                    <Route
                        path="*"
                        element={
                            isSuperAdmin
                                ? <Navigate to={`${process.env.PUBLIC_URL}/dashboard`} />
                                : <Unauthorized />
                        }
                    />
                </ReactRoutes>
                <ScrollToTop />
            </div>
        </div>
    );
}

export default MainIndex;