import { combineReducers } from "redux";
import Mainreducer from "./Mainreducer";
import ProductReducer from "./ProductReducer";
import CategoryReducer from "./CategoryReducer";
import SubCategoryReducer from "./SubCategoryReducer";
import AttributeReducer from "./AttributeReducer";
import TagReducer from "./TagReducer";
import CallAndChatReducer from "./CallAndChatReducer";
import CouponReducer from "./CouponReducer";
import BrandReducer from "./BrandReducer";
import InterestsReducer from "./InterestsReducer";
import ProfileReducer from "./ProfileReducer";
import ServiceReducer from "./ServiceReducer";
import CommissionReducer from "./CommissionReducer";
import FAQReducer from "./FAQReducer";
import UsersReducer from "./UsersReducer";
import CsvInterestReducer from "./CsvInterestReducer";
import privacyReducer from './PrivacyReducer';
import CourseReducer from './CourseReducer';
import StudentReducer from './StudentReducer';
import LeadsReducer from './LeadsReducer';
import ReviewCourseReducer from './ReviewCourseReducer';
import BannerReducer from './BannerReducer';
import AboutUsReducer from './AboutUsReducer';
import TermsConditionsReducer from './TermsConditionsReducer';
import RefundPolicyReducer from './RefundPolicyReducer';
import InstructorLeadsReducer from './InstructorLeadsReducer';
import SupportQueryReducer from './SupportQueryReducer';
import AstroReducer from './AstroReducer';
import AIAstrologerReducer from './AIAstrologerReducer';
import LanguageReducer from './LanguageReducer';
import UserManagementReducer from './UserManagementReducer';
import CoupansReducer from './CoupansReducer';
import ExpertisePro from './ExpertisePro';
import AddOfferReducer from './AddOfferReducer';
import ConsultationReducer from './ConsultationReducer';
import UserFeedbackReducerList from './UserFeedbackReducerList';
import UserFeedBacksupport from './UserFeedBacksupportReducer';
import AstroTicketReducer from './AstroTicketReducer';
import FeedbackCallbackReducer from './FeedbackCallbackReducer';
import ReferEarnFAQsReducer from './ReferEarnFAQsReducer';
import InvoiceReportReducer from './InvoiceReportReducer';
import PayoutReducer from './PayoutReducer';
import CreditNoteReportReducer from './CreditNoteReportReducer';
import UserTicketReducer from './UserTicketReducer';
import UserRoleReducer from './UserRoleReducer';
import RoleReducer from './RoleReducer';

 
export default combineReducers({
    Mainreducer,
    ProductReducer,
    RoleReducer,
    UserRoleReducer,
    AboutUsReducer,
    UserFeedBacksupport,
    UserTicketReducer,
    CreditNoteReportReducer,
    PayoutReducer,
    ReferEarnFAQsReducer,
    ReviewCourseReducer,
    CallAndChatReducer,
    InvoiceReportReducer,
    CategoryReducer,
    UserManagementReducer,
    ConsultationReducer,
    LanguageReducer,
    ExpertisePro,
    FeedbackCallbackReducer,
    CoupansReducer,
    RefundPolicyReducer,
    SubCategoryReducer,
    AstroReducer,
    AIAstrologerReducer,
    AttributeReducer,
    TagReducer,
    CouponReducer,
    InstructorLeadsReducer,
    SupportQueryReducer,
    BrandReducer,
    InterestsReducer,
    ProfileReducer,
    AstroTicketReducer,
    ServiceReducer,
    CommissionReducer,
    FAQReducer,
    UsersReducer,
    BannerReducer,
    TermsConditionsReducer,
    CsvInterestReducer,
    privacy: privacyReducer,
    CourseReducer,
    StudentReducer,
    LeadsReducer,
    AddOfferReducer,
    UserFeedbackReducerList
})