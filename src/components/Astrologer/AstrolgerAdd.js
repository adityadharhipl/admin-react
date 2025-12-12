import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { FaEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { postAstro, updateAstro } from "../../Redux/Reducers/AstroReducer";
import { uploadImagecertifates, uploadMultipleImages } from "../../Redux/Actions/Action";
import { fetchExpertise } from "../../Redux/Reducers/ExpertisePro";
import { IoClose } from "react-icons/io5";
import { BsCloudUpload } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import { Country, State, City } from "country-state-city";
import { Box, CircularProgress } from "@mui/material";
// Mixpanel tracking removed

function AstrolgerAdd() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        control,
    } = useForm();


    const [profileImg, setProfileImg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [languageData, setLanguagesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQualification, setSelectedQualification] = useState("");
    const [videoFile, setVideoFile] = useState([]);
    const [photoes, setPhotoes] = useState([]);
    const [panCardPreview, setPanCardPreview] = useState(null);
    const [gstPreview, setGstPreview] = useState(null);
    const [handleGallery, setHandleGallery] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [aadharImages, setAadharImages] = useState([]);
    const [certificateFiles, setCertificateFiles] = useState([]);
    const [certificateMultiFiles, setCertificateMultiFiles] = useState([]);
    const [gstFile, setFiles] = useState([]);
    const [appointmentType, setAppointmentType] = useState(null);
    const [chequePreview, setChequePreview] = useState(null);
    const [status, setStatus] = useState("pending")
    const [countryOptions, setCountryOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [tagOptions, settagOptions] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [videoIntroFile, setVideoIntroFile] = useState(null);
    const ExpertiseData = useSelector((state) => state?.ExpertisePro?.expertiseData);
    const [expectedRange, setExpectedRange] = useState("")
    const experienceOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());



    const handleProfileImgChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `${process.env.REACT_APP_ADMIN_TOKEN}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to upload image");

                const responseData = await response.json();
                const imageUrl = responseData?.data?.img;

                if (imageUrl) setProfileImg(imageUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload profile image.");
            }
        }
    };

    useEffect(() => {
        const fetchtags = async () => {
            try {
                const token = localStorage.getItem("User-admin-token");
                const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/tag`, {
                    headers: {
                        Authorization: token,
                    },
                });
                const tags = response?.data?.data || [];

                const options = tags.map((tag) => ({
                    value: tag._id,
                    label: tag.tagName,
                }));
                settagOptions(options);
            } catch (err) {
                console.error("Failed to fetch astro tags", err);
            }
        };

        fetchtags();
    }, []);


    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const token = localStorage.getItem("User-admin-token");
                const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/language`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch languages");
                }

                const data = await response.json();
                setLanguagesData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    useEffect(() => {
        dispatch(fetchExpertise());
    }, [dispatch]);

    const handleStatusSubmit = async (data) => {
        try {
            const token = localStorage.getItem("User-admin-token");

            const response = await axios.patch(
                `${process.env.REACT_APP_BASEURL}/admin/astroBankDetailVerify/${id}`,
                { status: status },
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.status === 200) {

                if (response?.data?.success) {
                    setStatus(response.data.success);
                }
                handleClose();
                toast.success(
                    "The details have been submitted, please click on 'Save' at the end of the form, to update the details."
                );
            } else {
                toast.error("Failed to update status. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
        }
    };

    const appointOptions = [
        { value: "online", label: "online consultaion" },
        { value: "physical", label: "Physical Visit" },
    ];

    const selectedType = watch("appointmentType");
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];
    const [selectedForAllDays, setSelectedForAllDays] = useState(false);

    const [availability, setAvailability] = useState({
        monday: [{ startTime: "", endTime: "" }],
        tuesday: [{ startTime: "", endTime: "" }],
        wednesday: [{ startTime: "", endTime: "" }],
        thursday: [{ startTime: "", endTime: "" }],
        friday: [{ startTime: "", endTime: "" }],
        saturday: [{ startTime: "", endTime: "" }],
        sunday: [{ startTime: "", endTime: "" }],
        default: [{ startTime: "", endTime: "" }],
    });

    const handleCheckboxChange = (e) => {
        setSelectedForAllDays(e.target.checked);
    };

    const addTimeSlot = (day) => {
        const newSlot = { startTime: "", endTime: "" };

        if (selectedForAllDays) {
            if (availability.default.length < 2) {
                setAvailability((prev) => ({
                    ...prev,
                    default: [...prev.default, newSlot],
                }));
            }
        } else {
            if (availability[day].length < 2) {
                setAvailability((prev) => ({
                    ...prev,
                    [day]: [...prev[day], newSlot],
                }));
            }
        }
    };

    const handleTimeChange = (day, index, field, value) => {
        if (selectedForAllDays) {
            setAvailability((prev) => {
                const newDefault = [...prev.default];
                newDefault[index] = { ...newDefault[index], [field]: value };
                return { ...prev, default: newDefault };
            });
        } else {
            setAvailability((prev) => {
                const newDaySlots = [...prev[day]];
                newDaySlots[index] = { ...newDaySlots[index], [field]: value };
                return { ...prev, [day]: newDaySlots };
            });
        }
    };


    const removeTimeSlot = (day, index) => {
        if (selectedForAllDays) {
            setAvailability((prev) => {
                const newArr = [...prev.default];
                newArr.splice(index, 1);
                return { ...prev, default: newArr };
            });
        } else {
            setAvailability((prev) => {
                const newArr = [...prev[day]];
                newArr.splice(index, 1);
                return { ...prev, [day]: newArr };
            });
        }
    };

    const languageOptions = languageData?.data?.map((lang) => ({
        value: lang._id,
        label: lang.languageName,
    }));
    const ExpertiseDataOptions = ExpertiseData?.data?.map((exp) => ({
        value: exp._id,
        label: exp.expertiseName,
    }));

    const handleExpertiseChange = (selectedOptions) => {
        const selectedExpertise = selectedOptions?.map((option) => option?.value);
        setValue("expertise", selectedExpertise);
    };

    const handleLanguageChange = (selectedOptions) => {
        const selectedLanguages = selectedOptions?.map((option) => option?.value);
        setValue("languages", selectedLanguages);
    };


    const appointOption1 = [
        { value: "onlineConsultation", label: "Online Consultation" },
        { value: "physicalRate", label: "Physical Rate" },
    ];
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = () => {
        setIsOpen(false);
        setCurrentImage("");
    };

    const handleImageAadharChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));

        if (validFiles.length === 0) {
            return;
        }

        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));
            if (!uploadedUrls || uploadedUrls.length === 0) {
                return;
            }

            setValue("aadharImg", uploadedUrls);
            setAadharImages((prevState) => [...prevState, ...uploadedUrls]);

            const payload = {
                aadharImg: uploadedUrls,
            };

        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    const removeAadharImage = (index) => {
        setAadharImages((prevState) => prevState.filter((_, i) => i !== index));
    };

    const handlePenCrdImg = async (e, fieldName) => {
        const file = e.target.files[0];

        if (!file) {

            setValue(fieldName, "");
            return;
        }

        if (!file.type.startsWith("image/")) {
            console.error("Invalid file type. Please upload an image.");
            return;
        }

        try {
            const previewUrl = URL.createObjectURL(file);

            const imageUrl = await dispatch(uploadImagecertifates(file));

            if (imageUrl) {
                setValue(fieldName, imageUrl);
            }
            setPanCardPreview(imageUrl);
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    const removeGstImage = () => {
        setGstPreview(null);
    };

    const handleImageGstChange = async (e, fieldName) => {
        const file = e?.target?.files?.[0];

        if (!file) {
            console.error("No file selected.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            console.error("Invalid file type. Please upload an image.");
            return;
        }

        try {
            const imageUrl = await dispatch(uploadImagecertifates(file));

            if (imageUrl) {
                setValue(fieldName, imageUrl);
            }
            setGstPreview(imageUrl);
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    const removeCertificateImage = (indexToRemove) => {
        setCertificateFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const removePanCardImage = () => {
        setPanCardPreview(null);
        setValue("panCardImg", "");
    };

    const handleImageCertificateChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === 0) {

            return;
        }
        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));

            if (!uploadedUrls || uploadedUrls.length === 0) {
                console.error("No files uploaded successfully.");
                return;
            }

            setValue("certificates", uploadedUrls);
            setCertificateFiles((prevState) => [...prevState, ...uploadedUrls]);

            const payload = {
                certificates: uploadedUrls,
            };

        } catch (error) {
            console.error("File upload failed:", error);
        }
    };

    const removePhoto = (index) => {
        setPhotoes((prev) => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setVideoFile((prev) => prev.filter((_, i) => i !== index));
    };

    const removeGalleryImage = (index) => {
        setHandleGallery((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === 0) {
            console.error("Please upload valid image files.");
            return;
        }
        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));

            if (!uploadedUrls || uploadedUrls.length === 0) {
                console.error("No files uploaded successfully.");
                return;
            }
            setValue("photoGallery", uploadedUrls);
            setPhotoes((prevState) => [
                ...(Array.isArray(prevState) ? prevState : []),
                ...uploadedUrls,
            ]);
            const payload = {
                certificates: uploadedUrls,
            };

        } catch (error) {
            console.error("File upload failed:", error);
        }
    };





    // START: Added functions for Audio and Video Intro
    const handleAudioChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("audio/"));

        if (validFiles.length === 0) {
            toast.error("Please upload valid audio files.");
            return;
        }

        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));
            if (!uploadedUrls || uploadedUrls.length === 0) {
                toast.error("No audio files uploaded successfully.");
                return;
            }
            const currentAudio = watch("audio") || [];
            const newAudioFiles = [...currentAudio, ...uploadedUrls];

            setValue("audio", newAudioFiles);
            setAudioFiles(newAudioFiles);
            toast.success("Audio file(s) uploaded.");
        } catch (error) {
            console.error("Audio upload failed:", error);
            toast.error("Audio upload failed.");
        } finally {
            // Reset the file input so the same file can be re-uploaded
            e.target.value = null;
        }
    };

    const handleVideoIntroChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("video/")) {
            toast.error("Please upload a valid video file.");
            return;
        }

        try {
            const uploadedUrls = await dispatch(uploadMultipleImages([file]));
            if (!uploadedUrls || !uploadedUrls.length) {
                toast.error("Video intro upload failed.");
                return;
            }
            const videoUrl = uploadedUrls[0];
            setValue("videoIntro", videoUrl);
            setVideoIntroFile(videoUrl);
            toast.success("Video intro uploaded.");
        } catch (error) {
            console.error("Video intro upload failed:", error);
            toast.error("Video intro upload failed.");
        } finally {
            // Reset the file input
            e.target.value = null;
        }
    };


    const removeAudio = (index) => {
        const newAudioFiles = audioFiles.filter((_, i) => i !== index);
        setAudioFiles(newAudioFiles);
        setValue("audio", newAudioFiles); // Correctly update react-hook-form state
    };

    const removeVideoIntro = () => {
        setVideoIntroFile(null);
        setValue("videoIntro", ""); // Correctly update react-hook-form state
    };

    const handleVideoChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("video/"));

        if (validFiles.length === 0) {
            console.error("Please upload valid video files.");
            return;
        }

        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));
            if (!uploadedUrls || uploadedUrls.length === 0) {
                console.error("No videos uploaded successfully.");
                return;
            }
            setValue("videos", uploadedUrls);
            setVideoFile((prevState) => [
                ...(Array.isArray(prevState) ? prevState : []),
                ...uploadedUrls,
            ]);

            const payload = {
                videos: uploadedUrls,
            };

        } catch (error) {
            console.error("Video upload failed:", error);
        }
    };

    const handleGalleryChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === 0) {
            console.error("Please upload valid image files.");
            return;
        }
        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));
            if (!uploadedUrls || uploadedUrls.length === 0) {
                console.error("No gallery photos uploaded successfully.");
                return;
            }
            setValue("photoGallery", uploadedUrls);
            setHandleGallery((prevState) => [
                ...(Array.isArray(prevState) ? prevState : []),
                ...uploadedUrls,
            ]);

            const payload = {
                gallery: uploadedUrls,
            };

        } catch (error) {
            console.error("Gallery photo upload failed:", error);
        }
    };


    const removeCertificateMultiFile = (indexToRemove) => {
        setCertificateMultiFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleCertificateChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === 0) {
            console.error("Please upload valid image files.");
            return;
        }
        try {
            const uploadedUrls = await dispatch(uploadMultipleImages(validFiles));
            if (!uploadedUrls || uploadedUrls.length === 0) {
                console.error("No certificates uploaded successfully.");
                return;
            }

            setValue("certificateGallery", uploadedUrls);
            setCertificateMultiFiles((prevState) => [
                ...(Array.isArray(prevState) ? prevState : []),
                ...uploadedUrls,
            ]);
            const payload = {
                certificates: uploadedUrls,
            };

        } catch (error) {
            console.error("Certificate upload failed:", error);
        }
    };

    const convertTo24HourFormat = (timeStr) => {
        if (!timeStr) return "00:00";
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);

        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        }
        if (modifier === "AM" && hours === 12) {
            hours = 0;
        }
        if (hours === 0 && minutes === "00") {
            return "12:00 AM";
        }
        return `${hours < 10 ? '0' + hours : hours}:${minutes}`;
    };



    useEffect(() => {
        if (!id) return;

        const fetchAstrologer = async () => {
            try {
                const token = localStorage.getItem("User-admin-token");
                if (!token) {
                    toast.error("Token missing");
                    return;
                }

                const response = await axios.get(
                    `${process.env.REACT_APP_BASEURL}/admin/getAstro/${id}`,
                    {
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const astroData = response?.data?.data;
                setExpectedRange(astroData?.expectedRange || "");
                if (!astroData) {
                    toast.error("Astrologer data not found");
                    return;
                }

                console.log("Astrologer API Data:", astroData);

                // =============== City, State, Country ================
                const astroCity = astroData?.city;
                const astroState = astroData?.state;
                const astroCountryCode = astroData?.countryCode || "+91";
                let stateSetFromDropdown = false; // Track if state was set from dropdown matching

                // Set countryCode field
                setValue("countryCode", astroCountryCode);

                // Fetch and set country/state/city using country-state-city library
                try {
                    // Get all countries
                    const countries = Country.getAllCountries().map((country) => ({
                        label: country.name,
                        value: country.name,
                        countryCode: country.isoCode,
                        phonecode: country.phonecode,
                    }));
                    setCountryOptions(countries);

                    // Find India (default) or country matching countryCode
                    const countryCode = astroCountryCode?.replace("+", "") || "91";
                    const india = countries.find((c) => c.countryCode === "IN" || c.phonecode === countryCode);
                    const selectedCountryData = india || countries[0]; // Default to India or first country

                    if (selectedCountryData) {
                        setSelectedCountry(selectedCountryData);

                        // Get states for selected country
                        const states = State.getStatesOfCountry(selectedCountryData.countryCode).map((state) => ({
                            label: state.name,
                            value: state.name,
                            stateCode: state.isoCode,
                            countryCode: selectedCountryData.countryCode,
                        }));
                        setStateOptions(states);

                        // Match state from astroData
                        if (astroState) {
                            const matchedState = states.find(
                                (s) => s.value.toLowerCase() === astroState?.toLowerCase()
                            );

                            if (matchedState) {
                                setSelectedState(matchedState);
                                setValue("state", matchedState.value);
                                stateSetFromDropdown = true;

                                // Get cities for matched state
                                const cities = City.getCitiesOfState(selectedCountryData.countryCode, matchedState.stateCode).map((city) => ({
                                    label: city.name,
                                    value: city.name,
                                }));
                                setCityOptions(cities);

                                // Match city from astroData
                                if (astroCity) {
                                    const matchedCity = cities.find(
                                        (c) => c.label.toLowerCase() === astroCity?.toLowerCase()
                                    );
                                    if (matchedCity) {
                                        setValue("city", matchedCity.label);
                                        setSelectedCity(matchedCity);
                                    } else {
                                        setValue("city", astroCity);
                                    }
                                }
                            } else {
                                // State not found, set directly
                                setValue("state", astroState);
                                if (astroCity) {
                                    setValue("city", astroCity);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching country/state/city:", error);
                    // Set values directly if library fails
                    if (astroState) {
                        setValue("state", astroState);
                    }
                    if (astroCity) {
                        setValue("city", astroCity);
                    }
                }

                // =============== Availability =================
                const { _id, ...availability } = astroData?.availability || {};
                Object.keys(availability || {}).forEach((day) => {
                    if (Array.isArray(availability[day])) {
                        availability[day] = availability[day].map((timeSlot) => ({
                            ...timeSlot,
                            startTime: convertTo24HourFormat(timeSlot.startTime),
                            endTime: convertTo24HourFormat(timeSlot.endTime),
                        }));
                    }
                });

                setValue("availability", availability);
                setAvailability(availability);

                const isAnyDayFilled = days.some(
                    (day) => Array.isArray(availability[day]) && availability[day].length > 0
                );
                setSelectedForAllDays(
                    astroData?.availability?.default?.length > 0 && !isAnyDayFilled
                );
                setValue(
                    "selectedForAllDays",
                    astroData?.availability?.default?.length > 0 && !isAnyDayFilled
                );

                // =============== Basic Form Fields =================
                setValue("fullName", astroData?.fullName || "");
                setValue("email", astroData?.email || "");
                setValue("mobileNumber", astroData?.mobileNumber || "");
                setValue("gender", astroData?.gender || "");
                setValue("pincode", astroData?.pincode || "");
                // State is already set above in country/state/city section, only set if not already set from dropdown
                if (!stateSetFromDropdown && astroState) {
                    setValue("state", astroState);
                }
                setValue("address", astroData?.address || "");
                setValue("aadharNo", astroData?.aadharNo || "");
                setValue("profileBio", astroData?.profileBio || "");
                setValue("gstNo", astroData?.gstNo || "");
                setValue("panCardNo", astroData?.panCardNo || "");
                setValue("experience", astroData?.experience ? { value: astroData.experience, label: `${astroData.experience} Year${astroData.experience === '1' ? '' : 's'}` } : "");
                setValue("specialization", astroData?.specialization || "");
                setProfileImg(astroData?.profileImg || "");
                setValue("profileImg", astroData?.profileImg || "");

                // =============== Qualification =================
                const qualification = astroData?.qualification;
                if (["10+2", "Graduate", "Postgraduate"].includes(qualification)) {
                    setSelectedQualification(qualification);
                    setValue("qualification", qualification);
                } else if (qualification) {
                    setSelectedQualification("Other");
                    setValue("qualification", qualification);
                }

                // =============== Tags =================
                if (astroData?.tag?._id) {
                    setValue("tag", astroData.tag._id);
                }

                // =============== Languages & Expertise =================
                setValue("languages", astroData?.languages?.map((l) => l._id) || []);
                setValue("expertise", astroData?.expertise?.map((e) => e._id) || []);
                // START: Update useEffect to populate Audio and Video Intro state
                setValue("audio", astroData?.audio || []);
                setAudioFiles(astroData?.audio || []);

                setValue("videoIntro", astroData?.videoIntro || null);
                setVideoIntroFile(astroData?.videoIntro || null);

                // =============== Media & Documents =================
                setValue("aadharImg", astroData?.aadharImg || "");
                setAadharImages(astroData?.aadharImg || "");

                setValue("panCardImg", astroData?.panCardImg || "");
                setPanCardPreview(astroData?.panCardImg || "");

                setValue("certificates", astroData?.certificates || []);
                setCertificateFiles(astroData?.certificates || []);

                setValue("photoGallery", astroData?.photoGallery || []);
                setHandleGallery(astroData?.photoGallery || []);

                setValue("photos", astroData?.photos || []);
                setPhotoes(astroData?.photos || []);

                setValue("videos", astroData?.videos || []);
                setVideoFile(astroData?.videos || []);

                setValue("certificateGallery", astroData?.certificateGallery || []);
                setCertificateMultiFiles(astroData?.certificateGallery || []);

                // =============== Bank Details =================
                const bank = astroData?.bankDetails || {};
                setValue("beneficiaryName", bank.beneficiaryName || "");
                setValue("bankName", bank.bankName || "");
                setValue("ifscCode", bank.ifscCode || "");

                setValue("accountNumber", bank.accountNumber || "");
                setValue("cancelledCheque", bank.cancelledCheque || "");
                setChequePreview(bank.cancelledCheque || "");
                setStatus(bank.verification || "pending");

                // =============== Billing =================
                const billing = astroData?.billingDetails || {};
                setValue("panCard", billing.panCard || "");
                setValue("aadharCard", billing.aadharCard || "");
                setValue("gstNumber", billing.gstNumber || "");
                setValue("gstCertificate", billing.gstCertificate || "");
                setGstPreview(billing.gstCertificate || "");

                // =============== Charges =================
                setValue("commissionPercentage", astroData?.commissionPercentage || "");

                setValue("chat", {
                    ratePerMinute: astroData?.chat?.ratePerMinute || "",
                    offerPricePerMinute: astroData?.chat?.offerPricePerMinute || "",
                });

                setValue("call", {
                    ratePerMinute: astroData?.call?.ratePerMinute || "",
                    offerPricePerMinute: astroData?.call?.offerPricePerMinute || "",
                });

                setValue("videoCall", {
                    ratePerMinute: astroData?.videoCall?.ratePerMinute || "",
                    offerPricePerMinute: astroData?.videoCall?.offerPricePerMinute || "",
                });

                // setValue("physicalVisit", {
                //     ratePerMinute: astroData?.physicalVisit?.ratePerMinute || "",
                //     offerPricePerMinute: astroData?.physicalVisit?.offerPricePerMinute || "",
                // });

            } catch (error) {
                console.error("Error fetching astrologer:", error?.response || error);
                toast.error("Failed to fetch astrologer details");
            }
        };

        fetchAstrologer();
    }, [id, setValue]);


    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true);
    };

    const onSubmit = async (data) => {
        handleClose();
        if (typeof data.panCardImg === "object" && Object.keys(data.panCardImg).length === 0) {
            data.panCardImg = "";
        }
        if (typeof data.gstCertificate === "object" && Object.keys(data.gstCertificate).length === 0) {
            data.gstCertificate = "";
        }
        const {
            selectedForAllDays,
            bankName,
            ifscCode,
            accountNumber,
            panCard,
            aadharCard,
            gstNumber,
            chat,
            call,
            videoCall,
            // physicalVisit,
            cancelledCheque,
            beneficiaryName,
            tag,
            ...payloadData
        } = data;

        try {

            let formattedAvailability = selectedForAllDays
                ? { default: availability.default }
                : Object.fromEntries(Object.entries(availability).filter(([key]) => key !== "default"));


            let payload = {
                ...payloadData,
                experience: payloadData.experience?.value || payloadData.experience,
                profileImg: typeof profileImg === "string"
                    ? profileImg
                    : profileImg?.[0] || null,
                aadharImg: aadharImages,
                certificates: certificateFiles,
                photoGallery: handleGallery,
                photos: photoes,
                videos: videoFile,
                tag: tag,
                certificateGallery: certificateMultiFiles,
                availability: formattedAvailability,
                bankDetails: {
                    bankName: bankName || null,
                    beneficiaryName: beneficiaryName || null,
                    ifscCode: ifscCode || null,
                    accountNumber: accountNumber || null,
                    cancelledCheque: cancelledCheque || null,
                },
                billingDetails: {
                    panCard: panCard,
                    aadharCard: aadharCard,
                    gstNumber: gstNumber
                },
                chat: {
                    ratePerMinute: chat?.ratePerMinute,
                    offerPricePerMinute: chat?.offerPricePerMinute
                },
                call: {
                    ratePerMinute: call?.ratePerMinute,
                    offerPricePerMinute: call?.offerPricePerMinute
                },
                videoCall: {
                    ratePerMinute: videoCall?.ratePerMinute,
                    offerPricePerMinute: videoCall?.offerPricePerMinute,
                },
                panCardImg: Array.isArray(data?.panCardImg) ?
                    data?.panCardImg[0] : data?.panCardImg || null,
                gstCertificate: Array.isArray(data?.gstCertificate)
                    ? data.gstCertificate[0]
                    : data?.gstCertificate ?? null,
                // physicalVisit: {
                //     ratePerMinute: physicalVisit?.ratePerMinute,
                //     offerPricePerMinute: physicalVisit?.offerPricePerMinute,
                // }
            };


            if (id) {
                await dispatch(updateAstro({ id, payload })).unwrap();
                toast.success("Astrologer updated successfully!");
                navigate(`/astrologer-view/${id}`);
            } else {
                await dispatch(postAstro(payload)).unwrap();
                toast.success("Astrologer created successfully!");
                navigate(`/astrologer-list`);
            }

        } catch (error) {
            console.log("Astro Error:", error);
            const errMsg =
                error || error?.message ||
                error?.error?.message ||
                error?.response?.data?.message ||
                "Failed to save Astrologer";
            toast.error(errMsg);
        }
    };

    useEffect(() => {
        // Fetch countries using country-state-city library
        const fetchCountries = () => {
            try {
                const countries = Country.getAllCountries().map((country) => ({
                    label: country.name,
                    value: country.name,
                    countryCode: country.isoCode,
                    phonecode: country.phonecode,
                }));
                setCountryOptions(countries);

                // Default select India
                const india = countries.find((c) => c.countryCode === "IN" || c.label === "India");
                if (india) {
                    setSelectedCountry(india);
                    fetchStates(india.countryCode);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
                toast.error("Unable to load countries.");
            }
        };

        fetchCountries();
    }, []);

    const fetchStates = (countryCode) => {
        try {
            const states = State.getStatesOfCountry(countryCode).map((state) => ({
                label: state.name,
                value: state.name,
                stateCode: state.isoCode,
                countryCode: countryCode,
            }));
            setStateOptions(states);
        } catch (error) {
            console.error("Error fetching states:", error);
            setStateOptions([]);
        }
    };

    const fetchCities = (stateCode, countryCode) => {
        try {
            const cities = City.getCitiesOfState(countryCode, stateCode).map((city) => ({
                label: city.name,
                value: city.name,
            }));
            setCityOptions(cities);
        } catch (error) {
            console.error("Error fetching cities:", error);
            setCityOptions([]);
        }
    };
    useEffect(() => {
        if (selectedCountry?.countryCode) {
            fetchStates(selectedCountry.countryCode);
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedState?.stateCode && selectedCountry?.countryCode) {
            fetchCities(selectedState.stateCode, selectedCountry.countryCode);
        }
    }, [selectedState]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <button
                onClick={() => window.history.back()}
                style={{
                    marginBottom: "10px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    color: "#007bff",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    padding: "10px 20px",
                }}
            >
                <span style={{ marginRight: "8px" }}>&lt;</span>
                <span style={{ position: "relative", display: "inline-block" }}>
                    Back
                    <span
                        style={{
                            content: "''",
                            position: "absolute",
                            left: 0,
                            bottom: -2,
                            width: "100%",
                            height: "1px",
                            borderBottom: "2px solid #007bff",
                        }}
                    ></span>
                </span>
            </button>

            <Toaster />
            <div>
                <div className="col-sm-12">
                    <div className="file-upload">
                        <label htmlFor="profile-file-input">
                            <img
                                src={profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt="Profile Icon"
                                className="icon"
                            />
                            <div className="edit-icon">
                                <FaPen />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="profile-file-input"
                            onChange={handleProfileImgChange}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>
                <div class="row align-items-center">
                    <div class="border-0 mb-4">
                        <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                            <h3 class="fw-bold mb-0"></h3>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-sm-6">
                            <label className="form-label">Full Name</label>
                            <input
                                {...register(
                                    "fullName",
                                    // { required: 'Full Name is required' }
                                )}
                                className={`form-control ${errors?.fullName ? "is-invalid" : ""}`}
                                placeholder="Your Name"
                            />
                            {errors.fullName && (
                                <p className="text-danger">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div className="col-sm-6">
                            <label className="form-label">Email Id</label>
                            <input
                                {...register(
                                    "email",
                                    // { required: 'email is required' }
                                )
                                }
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                placeholder="Enter Your Email"
                            />
                            {errors.email && (
                                <p className="text-danger">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="col-sm-6">
                            <label className="form-label">Phone Number</label>
                            <input
                                {...register("mobileNumber", {
                                    required: 'Mobile number is required',
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Mobile number must be 10 digits"
                                    }
                                })}
                                className={`form-control ${errors.mobileNumber ? "is-invalid" : ""}`}
                                placeholder="Enter Your Mobile Number"
                            />
                            {errors.mobileNumber && (
                                <p className="text-danger">{errors.mobileNumber.message}</p>
                            )}
                        </div>

                        <div className="col-sm-6">
                            <label className="form-label">Gender</label>
                            <div className="d-flex gap-3">
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        value="Male"
                                        {...register("gender", { required: "Gender is required" })}
                                        className={`form-check-input ${errors.gender ? "is-invalid" : ""}`}
                                        id="genderMale"
                                    />
                                    <label className="form-check-label" htmlFor="genderMale">
                                        Male
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input
                                        type="radio"
                                        value="Female"
                                        {...register("gender", { required: "Gender is required" })}
                                        className={`form-check-input ${errors.gender ? "is-invalid" : ""}`}
                                        id="genderFemale"
                                    />
                                    <label className="form-check-label" htmlFor="genderFemale">
                                        Female
                                    </label>
                                </div>
                            </div>

                            {errors.gender && (
                                <p className="text-danger">{errors.gender.message}</p>
                            )}
                        </div>

                        <div className="col-sm-6">
                            <label className="form-label">Astro Tag</label>
                            <Controller
                                name="tag"
                                control={control}
                                // rules={{ required: "Astro Tag is required" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`form-select ${errors.tag ? "is-invalid" : ""}`}
                                    >
                                        <option value="">Select Astro Tag</option>
                                        {tagOptions.map((tag) => (
                                            <option key={tag.value} value={tag.value}>
                                                {tag.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.tag && (
                                <div className="invalid-feedback">{errors.tag.message}</div>
                            )}
                        </div>




                        <div className="col-sm-6">
                            <label className="form-label">State</label>

                            <Controller
                                name="state"
                                control={control}
                                // rules={{ required: "State is required" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`form-select ${errors.state ? "is-invalid" : ""}`}
                                        onChange={(e) => {
                                            const selectedValue = e.target.value;
                                            const selectedOption = stateOptions.find(opt => opt.value === selectedValue);
                                            field.onChange(selectedValue); // Update react-hook-form value
                                            setSelectedState(selectedOption || null); // Update local state
                                        }}
                                    >
                                        <option value="">Select State</option>
                                        {stateOptions.map((state) => (
                                            <option key={state.value} value={state.value}>
                                                {state.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.state && (
                                <div className="invalid-feedback">{errors.state.message}</div>
                            )}
                            {/* {errors.state && <p className="text-danger">{errors.state.message}</p>} */}
                        </div>


                        <div className="col-sm-6">
                            <label className="form-label">City</label>
                            <Controller
                                name="city"
                                control={control}
                                // rules={{ required: "City is required" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`form-select ${errors.city ? "is-invalid" : ""}`}
                                    >
                                        <option value="">Select City</option>
                                        {cityOptions.map((city) => (
                                            <option key={city.value} value={city.label}>
                                                {city.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                        </div>




                        <div className="col-sm-6">
                            <label className="form-label">Aadhar No.</label>
                            <input
                                {...register(
                                    "aadharNo"
                                )}
                                className="form-control "
                                type="number"
                                placeholder="Enter Your Aadhar No."
                            />

                        </div>
                        <div className="col-sm-6">
                            <label className="form-label">Pincode No.</label>
                            <input
                                {...register(
                                    "pincode"
                                )}
                                className="form-control "
                                type="number"
                                placeholder="Enter Your Pincode"
                            />

                        </div>
                        <div className="col-sm-6">
                            <label className="form-label">Pan card No.</label>
                            <input
                                {...register(
                                    "panCardNo"

                                )}
                                className="form-control "
                                type="text"
                                placeholder="Enter Your Pan card No."
                            />

                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">
                                Upload Aadhar Front & back photo
                            </label>
                            <div className="upload-container">
                                <label htmlFor="aadhar-upload" className="upload-label">
                                    Upload Aadhar photo
                                </label>
                                <label htmlFor="aadhar-upload">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>
                                <input
                                    id="aadhar-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageAadharChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                            {errors.aadharFile && (
                                <p className="text-danger">{errors.aadharFile.message}</p>
                            )}

                            <div className="uploaded-images mt-3 d-flex gap-2 flex-wrap">
                                {aadharImages.map((img, index) => (
                                    <div key={index} className="position-relative d-inline-block">
                                        <img
                                            src={img}
                                            alt="Aadhar Preview"
                                            width="100"
                                            height="100"
                                            className="rounded"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                            onClick={() => removeAadharImage(index)}
                                        >
                                            <IoIosClose size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>
                        <div className="col-sm-12">
                            <label className="form-label">Upload Pan Card Photo</label>
                            <div className="upload-container">
                                <label htmlFor="pan-upload" className="upload-label">
                                    Upload Pan Card Photo
                                </label>
                                <label htmlFor="pan-upload">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>
                                <input
                                    id="pan-upload"
                                    type="file"
                                    {...register("panCardImg")}
                                    onChange={(e) => handlePenCrdImg(e, "panCardImg")}
                                />
                            </div>
                            {panCardPreview && (
                                <div className="position-relative d-inline-block mt-2">
                                    <img
                                        src={panCardPreview}
                                        alt="Pan Card Preview"
                                        width="100"
                                        height="100"
                                        className="rounded"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                        style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                        onClick={() => setPanCardPreview(null)}
                                    >
                                        <IoIosClose size={18} />
                                    </button>
                                </div>
                            )}

                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">Address</label>
                            <textarea
                                {...register(
                                    "address",

                                )}
                                className={`form-control`}
                                style={{ minHeight: "80px" }}
                                placeholder="Type Your Address"
                            />

                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="row align-items-center mt-4">
                    <div class="border-0 mb-4">
                        <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                            <h3 class="fw-bold mb-0">Professional Information</h3>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row g-4">


                        <div className="col-sm-6">
                            <label className="form-label">Education Qualification</label>

                            <div className="position-relative">
                                <select
                                    {...register("qualification", {
                                        // required: "Education Qualification is required",
                                    })}
                                    className={`form-control ${errors.qualification ? "is-invalid" : ""}`}
                                    value={selectedQualification}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedQualification(value);
                                        if (value !== "Other") {
                                            setValue("qualification", value);
                                        } else {
                                            setValue("qualification", "");
                                        }
                                    }}
                                >
                                    <option value="">Select Qualification</option>
                                    <option value="10+2">10+2</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Postgraduate">Post Graduate</option>
                                    <option value="Other">Other</option>
                                </select>

                                {/* Arrow Icon (▼) */}
                                <span
                                    className="position-absolute"
                                    style={{
                                        top: '50%',
                                        right: '15px',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        fontSize: '14px',
                                        color: '#6c757d',
                                    }}
                                >
                                    ▼
                                </span>
                            </div>

                            {errors.qualification && (
                                <p className="text-danger">{errors.qualification.message}</p>
                            )}
                        </div>


                        {selectedQualification === "Other" && (
                            <div className="col-sm-6 mt-2">
                                <label className="form-label">Other Qualification</label>
                                <input
                                    {...register("qualification", {
                                        // required: "Other Qualification is required",
                                    })}
                                    type="text"
                                    className={`form-control ${errors.qualification ? "is-invalid" : ""}`}
                                    placeholder="Enter other qualification"
                                />
                                {errors.qualification && (
                                    <p className="text-danger">{errors.qualification.message}</p>
                                )}
                            </div>
                        )}


                        <div className="col-sm-6">
                            <div className="">
                                <label className="form-label">Languages</label>
                                <Controller
                                    name="languages"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            isMulti
                                            options={languageOptions}
                                            value={languageOptions?.filter((option) =>
                                                field.value?.includes(option.value)
                                            )}

                                            onChange={handleLanguageChange}

                                            placeholder="Select Languages"
                                            className={`form-control ${errors.languageOptions ? "is-invalid" : ""
                                                }`}
                                            classNamePrefix="select"
                                            isClearable={field.value?.length > 0}
                                        />
                                    )}
                                />
                                {errors.languageOptions && (
                                    <p className="text-danger">{errors.languageOptions.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <label className="form-label">Professional Expertise</label>
                            <Controller
                                name="expertise"
                                control={control}
                                // rules={{ required: "Please select at least one expertise." }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        isMulti
                                        options={ExpertiseDataOptions}
                                        value={ExpertiseDataOptions?.filter((option) =>
                                            field.value?.includes(option.value)
                                        )}
                                        onChange={(selectedOptions) =>
                                            field.onChange(selectedOptions.map(option => option.value))
                                        }
                                        placeholder="Select Expertise"
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                    // isClearable={field.value?.length > 0}
                                    />
                                )}
                            />
                            {/* {errors.expertise && (
                                <p className="text-danger">{errors.expertise.message}</p>
                            )} */}
                        </div>

                        <div className="col-sm-12">
                            <div className="d-flex justify-content-between align-items-center w-50 mb-4">
                                <label className="form-label">Availability Timing</label>
                                <div>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="flexCheckDefault"
                                        {...register("selectedForAllDays")}
                                        onChange={(e) => {
                                            setValue("selectedForAllDays", e.target.checked);
                                            setSelectedForAllDays(e.target.checked);
                                        }}
                                    />
                                    <label className="form-check-label ms-2" htmlFor="flexCheckDefault">
                                        Selected for all Days
                                    </label>
                                </div>

                            </div>

                            {selectedForAllDays ? (
                                <div className="default-availability mb-4">
                                    <h5>Default Availability (applies to all days)</h5>
                                    {availability?.default?.map((slot, index) => (
                                        <div key={index} className="row mb-3 align-items-end">
                                            <div className="col-sm-5">
                                                <label className="form-label">Start Time</label>
                                                <input
                                                    className="form-control"
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => handleTimeChange("default", index, "startTime", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-sm-5">
                                                <label className="form-label">End Time</label>
                                                <input
                                                    className="form-control"
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) => handleTimeChange("default", index, "endTime", e.target.value)}
                                                />
                                            </div>
                                            {availability.default.length > 1 && (
                                                <div className="col-sm-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => removeTimeSlot("default", index)}
                                                    >
                                                        -
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => addTimeSlot("default")}
                                        disabled={availability.default.length >= 2}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                // Individual day-based availability
                                days.map((day) => (
                                    <div key={day} className="day-availability mb-4">
                                        <div className="row mb-3 align-items-center">
                                            <div className="col-md-3">
                                                <label className="form-label">
                                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                                </label>
                                            </div>
                                            <div className="col-sm-8">
                                                {availability[day].map((slot, index) => (
                                                    <div key={index} className="row mb-2 align-items-end">
                                                        <div className="col-sm-5">
                                                            <input
                                                                className="form-control"
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => handleTimeChange(day, index, "startTime", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-sm-5">
                                                            <input
                                                                className="form-control"
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => handleTimeChange(day, index, "endTime", e.target.value)}
                                                            />
                                                        </div>
                                                        {availability[day].length > 1 && (
                                                            <div className="col-sm-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger"
                                                                    onClick={() => removeTimeSlot(day, index)}
                                                                >
                                                                    -
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="col-md-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => addTimeSlot(day)}
                                                    disabled={availability[day].length >= 2}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>

                    {/* Professional Experience */}
                    <div className="col-sm-6">
                        <label className="form-label">
                            Professional Experience years
                        </label>
                        <Controller
                            name="experience"
                            control={control}
                            rules={{ required: 'Experience years is required' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={experienceOptions.map(year => ({ value: year, label: `${year} Year${year === '1' ? '' : 's'}` }))}
                                    className={`basic-select ${errors.experience ? "is-invalid" : ""}`}
                                    classNamePrefix="select"
                                    placeholder="Select Experience Years"
                                    isClearable
                                />
                            )}
                        />
                        {errors.experience && (
                            <p className="text-danger">{errors.experience.message}</p>
                        )}
                    </div>

                    {/* GST No */}
                    <div className="col-sm-6">
                        <label className="form-label">GST No.</label>
                        <input
                            {...register(
                                "gstNo"
                                // ,
                                // { required: 'GST No. is required' }
                            )}
                            className={`form-control ${errors.gstNo ? "is-invalid" : ""}`}
                            type="text"
                            placeholder="Enter GST No"
                        />
                        {/* {errors.gstNo && (
                            <p className="text-danger">{errors.gstNo.message}</p>
                        )} */}
                    </div>



                    {/* Upload GST Certificate */}
                    <div className="col-sm-12">
                        <label className="form-label">Upload GST Certificate</label>
                        <div className="upload-container">
                            <label htmlFor="gst-upload" className="upload-label">
                                Upload GST Certificate
                            </label>
                            <label htmlFor="file-upload-video">
                                <span className="upload-icon">
                                    <BsCloudUpload />
                                </span>
                            </label>
                            <input
                                id="gst-upload"
                                type="file"
                                {...register("gstCertificate"

                                    //  { required: 'gstCertificate is required' }
                                )

                                }
                                onChange={(e) => handleImageGstChange(e, "gstCertificate")}
                            />
                        </div>
                        {errors.gstCertificate && (
                            <p className="text-danger">{errors.gstCertificate.message}</p>
                        )}
                        {gstPreview && (
                            <div className="position-relative d-inline-block mt-2">
                                <img
                                    src={gstPreview}
                                    alt="gstPreview"
                                    width="100"
                                    height="100"
                                    className="rounded"
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                    style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                    onClick={removeGstImage}
                                >
                                    <IoIosClose size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Upload Certificate */}
                    <div className="col-sm-12">
                        <label className="form-label">Upload Certificate</label>
                        <div className="upload-container">
                            <label htmlFor="certificate-upload" className="upload-label">
                                Upload Certificates
                            </label>
                            <label htmlFor="certificate-upload">
                                <span className="upload-icon">
                                    <BsCloudUpload />
                                </span>
                            </label>
                            <input
                                id="certificate-upload"
                                type="file"
                                multiple
                                {...register("certificates",
                                    //      {
                                    //     validate: () => certificateFiles.length > 0 || "Please upload at least one certificate."
                                    // }
                                )}
                                onChange={handleImageCertificateChange}
                            />
                        </div>

                        {/* {errors.certificates && (
                            <p className="text-danger">{errors.certificates.message}</p>
                        )} */}

                        {/* <div className="uploaded-images">
                            {certificateFiles?.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    src={imageUrl}
                                    alt="certificate"
                                    width="100"
                                    height="100"
                                />
                            ))}
                        </div> */}
                        <div className="uploaded-images d-flex gap-2 flex-wrap mt-2">
                            {certificateFiles.map((imageUrl, index) => (
                                <div key={index} className="position-relative d-inline-block">
                                    <img
                                        src={imageUrl}
                                        alt="certificate"
                                        width="100"
                                        height="100"
                                        className="rounded"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                        style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                        onClick={() => removeCertificateImage(index)}
                                    >
                                        <IoIosClose size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row align-items-center mt-4">
                <div className="border-0 mb-4">
                    <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                        <h3 className="fw-bold mb-0">Fees/Rate</h3>
                    </div>
                </div>
            </div>
            {expectedRange && (<small>Astrolger Expected Range: {expectedRange} Rs.</small>)}

            {/* Chat Section */}
            <div className="col-sm-12 mb-4">
                <label className="form-label">Chat</label>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("chat.ratePerMinute", {
                                    // // required: "Per minute rate is required",
                                    // min: { value: 1, message: "Rate must be greater than 0" },
                                    // valueAsNumber: true,
                                })}
                                className={`form-control ${errors.chat?.ratePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Actual Price"
                            />
                            <label>Actual Price</label>
                        </div>
                        {errors.chat?.ratePerMinute && (
                            <p className="text-danger">{errors.chat.ratePerMinute.message}</p>
                        )}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("chat.offerPricePerMinute", {
                                    // required: "Offer price is required",
                                    // min: { value: 1, message: "Offer Price must be greater than 0" },
                                    // valueAsNumber: true,
                                    // validate: (value) => {
                                    //     const actual = watch("chat.ratePerMinute");
                                    //     if (value > actual) return "Offer price cannot be greater than actual price";
                                    //     return true;
                                    // },
                                }
                                )}
                                className={`form-control ${errors.chat?.offerPricePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Offer Price "
                            />
                            <label>Offer price</label>
                        </div>
                        {errors.chat?.offerPricePerMinute && (
                            <p className="text-danger">{errors.chat.offerPricePerMinute.message}</p>
                        )}
                    </div>
                </div>
            </div>


            {/* Call Section */}
            <div className="col-sm-12 mb-4">
                <label className="form-label">Call</label>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("call.ratePerMinute",
                                    //      {
                                    //     required: "Actual price is required",
                                    //     min: { value: 1, message: "Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    // }
                                )}
                                className={`form-control ${errors.call?.ratePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Actual Price"
                            />
                            <label>Actual Price</label>
                        </div>
                        {errors.call?.ratePerMinute && (
                            <p className="text-danger">{errors.call.ratePerMinute.message}</p>
                        )}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("call.offerPricePerMinute",
                                    //     {
                                    //     required: "Offer price is required",
                                    //     min: { value: 1, message: "Offer Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    //     validate: value => {
                                    //         const actualPrice = watch("call.ratePerMinute");
                                    //         if (value > actualPrice) return "Offer Price cannot be greater than actual price";
                                    //         return true;
                                    //     }
                                    // }
                                )}
                                className={`form-control ${errors.call?.offerPricePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Offer Price"
                            />
                            <label>Offer Price</label>
                        </div>
                        {errors.call?.offerPricePerMinute && (
                            <p className="text-danger">{errors.call.offerPricePerMinute.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Repeat for Video Call */}
            <div className="col-sm-12 mb-4">
                <label className="form-label">Video Call</label>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("videoCall.ratePerMinute",
                                    //     {
                                    //     required: "Actual price is required",
                                    //     min: { value: 1, message: "Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    // }
                                )}
                                className={`form-control ${errors.videoCall?.ratePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Actual Price"
                            />
                            <label>Actual Price</label>
                        </div>
                        {errors.videoCall?.ratePerMinute && (
                            <p className="text-danger">{errors.videoCall.ratePerMinute.message}</p>
                        )}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("videoCall.offerPricePerMinute",
                                    //      {
                                    //     required: "Offer price is required",
                                    //     min: { value: 1, message: "Offer Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    //     validate: value => {
                                    //         const actualPrice = watch("videoCall.ratePerMinute");
                                    //         if (value > actualPrice) return "Offer price cannot be greater than actual price";
                                    //         return true;
                                    //     }
                                    // }
                                )}
                                className={`form-control ${errors.videoCall?.offerPricePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Offer Price"
                            />
                            <label>Offer Price</label>
                        </div>
                        {errors.videoCall?.offerPricePerMinute && (
                            <p className="text-danger">{errors.videoCall.offerPricePerMinute.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Repeat for Physical Visit */}
            {/* <div className="col-sm-12 mb-4">
                <label className="form-label">Physical Visit</label>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("physicalVisit.ratePerMinute",
                                    //     {
                                    //     required: "Actual price is required",
                                    //     min: { value: 1, message: "Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    // }
                                )}
                                className={`form-control ${errors.physicalVisit?.ratePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Actual Price"
                            />
                            <label>Actual Price</label>
                        </div>
                        {errors.physicalVisit?.ratePerMinute && (
                            <p className="text-danger">{errors.physicalVisit.ratePerMinute.message}</p>
                        )}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-floating">
                            <input
                                {...register("physicalVisit.offerPricePerMinute",
                                    //     {
                                    //     required: "Offer price is required",
                                    //     min: { value: 1, message: "Offer Price must be greater than 0" },
                                    //     valueAsNumber: true,
                                    //     validate: value => {
                                    //         const actualPrice = watch("physicalVisit.ratePerMinute");
                                    //         if (value > actualPrice) return "Offer price cannot be greater than actual price";
                                    //         return true;
                                    //     }
                                    // }
                                )}
                                className={`form-control ${errors.physicalVisit?.offerPricePerMinute ? "is-invalid" : ""}`}
                                type="number"
                                placeholder="Offer Price"
                            />
                            <label>Offer Price</label>
                        </div>
                        {errors.physicalVisit?.offerPricePerMinute && (
                            <p className="text-danger">{errors.physicalVisit.offerPricePerMinute.message}</p>
                        )}
                    </div>
                </div>
            </div> */}


            {/* Commission Section */}
            {/* <div className="col-sm-6">
                <label className="form-label">Partner Remunration %</label>
                <input
                    {...register("commissionPercentage",
                        //     {
                        //     required: "Commission is required",
                        //     min: { value: 1, message: "Commission must be greater than 0" }
                        // }
                    )}
                    className={`form-control ${errors.commissionPercentage ? "is-invalid" : ""}`}
                    type="number"
                    placeholder="Partner Remunration %"
                />
                {errors.commissionPercentage && (
                    <p className="text-danger">{errors.commissionPercentage.message}</p>
                )}
            </div> */}


            <div>
                <div class="row align-items-center mt-4">
                    <div class="border-0 mb-4">
                        <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                            <h3 class="fw-bold mb-0">Bank Details</h3>
                            {id && (
                                <FaEdit
                                    size={24}
                                    style={{ marginLeft: "10px", cursor: "pointer", color: "#007bff" }}
                                    onClick={handleShow}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="card-body">

                    <div className="row g-4">
                        <div className="col-sm-4">
                            <label className="form-label">Name of Bank</label>
                            <input
                                {...register(
                                    "bankName"
                                    // { required: 'Name of Bank is required' }
                                )}
                                className={`form-control ${errors.bankName ? "is-invalid" : ""
                                    }`}
                                type="text"
                                placeholder="Name of Bank"
                            />
                            {/* {errors.bankName && (
                                <p className="text-danger">{errors.bankName.message}</p>
                            )} */}
                        </div>
                    </div>

                    {/* IFSC Code */}
                    <div className="col-sm-4">
                        <label className="form-label">IFSC Code</label>
                        <input
                            {...register("ifscCode",
                                // {
                                //     required: 'IFSC code is required',
                                //     pattern: {
                                //         value: /^[A-Za-z]{4}\d{7}$/,
                                //         message: "Please enter a valid IFSC code",
                                //     },
                                // }
                            )}
                            className={`form-control ${errors.ifscCode ? "is-invalid" : ""}`}
                            type="text"
                            placeholder="IFSC Code"
                        />
                        {errors.ifscCode && (
                            <p className="text-danger">{errors.ifscCode.message}</p>
                        )}
                    </div>

                    {/* Account Number */}
                    <div className="col-sm-4">
                        <label className="form-label">Account Number</label>
                        <input
                            {...register("accountNumber"
                                , {
                                    // required: 'Account Number is required',
                                    // pattern: {
                                    //     value: /^[0-9]{10,18}$/,
                                    //     message: "Please enter a valid account number",
                                    // },
                                }
                            )}
                            className={`form-control ${errors.accountNumber ? "is-invalid" : ""
                                }`}
                            type="text"
                            placeholder="Account Number"
                        />
                        {errors.accountNumber && (
                            <p className="text-danger">{errors.accountNumber.message}</p>
                        )}
                    </div>
                </div>
                {/* Modal for editing bank details */}
                <Modal show={show} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>View Bank Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit(handleStatusSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Beneficiary Name</Form.Label>
                                <Form.Control
                                    {...register("beneficiaryName",
                                        //  { required: "Name of Bank is required" }
                                    )
                                    }
                                    type="text"
                                />
                                {/* {errors.bankName && <p className="text-danger">{errors.bankName.message}</p>} */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Name of Bank</Form.Label>
                                <Form.Control
                                    {...register("bankName",
                                        //  { required: "Name of Bank is required" }
                                    )
                                    }
                                    type="text"
                                />
                                {/* {errors.bankName && <p className="text-danger">{errors.bankName.message}</p>} */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>IFSC Code</Form.Label>
                                <Form.Control
                                    {...register("ifscCode",
                                        // {
                                        // required: "IFSC Code is required",
                                        // pattern: {
                                        //     value: /^[A-Za-z]{4}\d{7}$/,
                                        //     message: "Please enter a valid IFSC code",
                                        // },
                                        // }
                                    )}
                                    type="text"
                                />
                                {/* {errors.ifscCode && <p className="text-danger">{errors.ifscCode.message}</p>} */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Account Number</Form.Label>
                                <Form.Control
                                    {...register("accountNumber",
                                        // {
                                        // required: "Account Number is required",
                                        // pattern: {
                                        //     value: /^[0-9]{10,18}$/,
                                        //     message: "Please enter a valid account number",
                                        // },
                                        // }
                                    )}
                                    type="text"
                                />
                                {/* {errors.accountNumber && <p className="text-danger">{errors.accountNumber.message}</p>} */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Preview Cancelled Cheque</Form.Label>
                                {chequePreview ? (
                                    <div>
                                        <img
                                            src={chequePreview}
                                            alt="Cancelled Cheque Preview"
                                            style={{ width: "100%", maxWidth: "300px", borderRadius: "5px" }}
                                        />
                                    </div>
                                ) : (
                                    <p>No cancelled cheque uploaded</p>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="all">Select</option>
                                    <option value="approved">Success</option>
                                    <option value="rejected">Reject</option>
                                </Form.Control>
                            </Form.Group>
                            <Button variant="success" type="submit">Save Changes</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
            <div>
                <div class="row align-items-center mt-4">
                    <div class="border-0 mb-4">
                        <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                            <h3 class="fw-bold mb-0">Billing Details</h3>
                        </div>
                    </div>
                </div>
                <div className="card-body">

                    <div className="row g-4">
                        <div className="col-sm-12">
                            <label className="form-label">PAN Card</label>
                            <input
                                {...register("panCard"
                                    //     , {
                                    //     required: 'PAN Card is required',
                                    //     pattern: {
                                    //         value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                                    //         message: "Please enter a valid PAN card number",
                                    //     },
                                    // }
                                )}
                                className={`form-control ${errors.panCard ? "is-invalid" : ""}`}
                                type="text"
                                placeholder="PAN Card"
                            />
                            {/* {errors.panCard && (
                                <p className="text-danger">{errors.panCard.message}</p>
                            )} */}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <label className="form-label">Aadhar Card</label>
                        <input
                            {...register("aadharCard"
                                // , {
                                // required: 'Aadhar Card is required',
                                // pattern: {
                                //     value: /^[2-9]{1}[0-9]{11}$/,
                                //     // message: "Please enter a valid Aadhar card number",
                                // },
                                // }
                            )}
                            className={`form-control ${errors.aadharCard ? "is-invalid" : ""
                                }`}
                            type="text"
                            placeholder="Aadhar Card"
                        />

                    </div>

                    <div className="col-sm-6">
                        <label className="form-label">GST Number (Optional)</label>
                        <input
                            {...register("gstNumber", {
                                // pattern: {
                                //     value: /^[0-9]{15}$/,
                                //     message: "Please enter a valid GST number (if provided)",
                                // },
                            })}
                            className={`form-control ${errors.gstNumber ? "is-invalid" : ""}`}
                            type="text"
                            placeholder="GST Number"
                        />
                        {/* {errors.gstNumber && (
                            <p className="text-danger">{errors.gstNumber.message}</p>
                        )} */}
                    </div>
                </div>
            </div>
            <div>
                <div class="row align-items-center mt-4">
                    <div class="border-0 mb-4">
                        <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                            <h3 class="fw-bold mb-0">About Me</h3>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {isOpen && (
                        <>
                            <div className={`modalss ${isOpen ? "show" : ""}`}>
                                <div className={`modal-contentss ${isOpen ? "show" : ""}`}>
                                    <button className="close-btnss" onClick={closeModal}>
                                        ✖
                                    </button>
                                    <img src={currentImage} alt="Pop-up" />
                                </div>
                            </div>
                            <div
                                className={`modal-overlayss ${isOpen ? "show" : ""}`}
                                onClick={closeModal}
                            ></div>
                        </>
                    )}
                    {/* </form> */}


                    <div className="row g-4">
                        <div className="col-sm-12">
                            <label className="form-label">Profile Bio</label>
                            <textarea
                                style={{ minHeight: "80px" }}
                                className="form-control"
                                placeholder="Profile Bio..."
                                {...register("profileBio"
                                    // , { required: 'profileBio is required' }
                                )}
                            ></textarea>
                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">Photos</label>
                            <div className="upload-container">
                                <label htmlFor="file-upload-photo" className="upload-label">
                                    Photo
                                </label>
                                <label htmlFor="file-upload-photo">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>
                                <input
                                    id="file-upload-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoChange(e)}
                                    multiple
                                />
                            </div>

                            <div className="review_imgCardMain uploaded-images mt-3">
                                {Array.isArray(photoes) && photoes.length > 0 ? (
                                    photoes?.map((imageUrl, index) => (
                                        <div
                                            key={index}
                                            className="position-relative d-inline-block me-2 mb-2"
                                        >
                                            <img
                                                src={imageUrl}
                                                alt="gallery"
                                                width="100"
                                                height="100"
                                                className="rounded"
                                            />
                                            <span
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                                onClick={() => removePhoto(index)}
                                            >
                                                <IoClose />
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No gallery images uploaded.</p>
                                )}
                            </div>

                        </div>
                        {/* START: Updated JSX for Audio and Video Intro */}
                        <div className="col-sm-12">
                            <label className="form-label">Audio</label>
                            <div className="upload-container">
                                <label htmlFor="file-upload-audio" className="upload-label">
                                    Upload Audio
                                </label>
                                <label htmlFor="file-upload-audio">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>
                                <input
                                    id="file-upload-audio"
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    multiple
                                />
                            </div>
                            <div className="uploaded-files mt-3 d-flex flex-wrap gap-2">
                                {Array.isArray(audioFiles) && audioFiles.map((audioUrl, index) => (
                                    <div key={index} className="position-relative">
                                        <audio controls src={audioUrl} style={{ width: "250px", height: "50px" }} />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            style={{ borderRadius: "50%", padding: "0.2rem 0.5rem", transform: "translate(50%, -50%)" }}
                                            onClick={() => removeAudio(index)}
                                        >
                                            <IoIosClose size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">Video Intro</label>
                            <div className="upload-container">
                                <label htmlFor="file-upload-video-intro" className="upload-label">
                                    Upload Video Intro
                                </label>
                                <label htmlFor="file-upload-video-intro">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>
                                <input
                                    id="file-upload-video-intro"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoIntroChange}
                                />
                            </div>
                            {videoIntroFile && (
                                <div className="position-relative d-inline-block mt-2">
                                    <video
                                        src={videoIntroFile}
                                        width="200"
                                        height="150"
                                        controls
                                        className="rounded"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                        style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                        onClick={removeVideoIntro}
                                    >
                                        <IoIosClose size={18} />
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="col-sm-12">
                            <label className="form-label">Videos</label>
                            <div className="upload-container">
                                <label htmlFor="file-upload-video" className="upload-label">
                                    Videos
                                </label>
                                <label htmlFor="file-upload-video">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>

                                <input
                                    id="file-upload-video"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVideoChange(e)}
                                    multiple
                                />
                            </div>

                            <div className="review_imgCardMain videropaly-play uploaded-images mt-3">

                                <ul>
                                    <li>
                                        <>
                                            <div className="videoclose">
                                                {Array.isArray(videoFile) && videoFile.length > 0 ? (
                                                    videoFile.map((videoUrl, index) => (
                                                        <video
                                                            key={index}
                                                            src={videoUrl}
                                                            width="100"
                                                            height="100"
                                                            controls
                                                        />
                                                    ))
                                                ) : (
                                                    <p></p>
                                                )}
                                                {/* <span><IoClose /></span> */}
                                                {videoFile.map((videoUrl, index) => (
                                                    <div key={index} className="position-relative d-inline-block me-2">
                                                        <video src={videoUrl} width="100" height="100" controls />
                                                        <span
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                            style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                                            onClick={() => removeVideo(index)}
                                                        >
                                                            <IoClose />
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    </li>
                                </ul>

                            </div>
                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">Gallery Photos</label>
                            <div className="upload-container">
                                <label htmlFor="file-upload-gallery" className="upload-label">
                                    Gallery Photos
                                </label>
                                <label htmlFor="file-upload-gallery">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>

                                <input
                                    id="file-upload-gallery"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleGalleryChange(e)}
                                    multiple
                                />
                            </div>
                            <div className="review_imgCardMain uploaded-images mt-3">
                                {Array.isArray(handleGallery) && handleGallery.length > 0 ? (
                                    handleGallery.map((imageUrl, index) => (
                                        <div key={index} className="position-relative d-inline-block me-2">
                                            <img src={imageUrl} alt="gallery" width="100" height="100" />
                                            <span
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                                onClick={() => removeGalleryImage(index)}
                                            >
                                                <IoClose />
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No gallery images uploaded.</p>
                                )}
                            </div>

                            {/* {handleGallery?.map((imageUrl, index) => (
                                <div key={index} className="position-relative d-inline-block me-2">
                                    <img src={imageUrl} alt="gallery" width="100" height="100" />
                                    <span
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                        style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                        onClick={() => removeGalleryImage(index)}
                                    >
                                        <IoClose />
                                    </span>
                                </div>
                            ))} */}

                        </div>

                        <div className="col-sm-12">
                            <label className="form-label">Certificate Gallery</label>
                            <div className="upload-container">
                                <label
                                    htmlFor="file-upload-certificate"
                                    className="upload-label"
                                >
                                    Certificate Gallery
                                </label>
                                <label htmlFor="file-upload-certificate">
                                    <span className="upload-icon">
                                        <BsCloudUpload />
                                    </span>
                                </label>

                                <input
                                    id="file-upload-certificate"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleCertificateChange(e)}
                                    multiple
                                />
                            </div>
                            <div className="review_imgCardMain uploaded-images mt-3">
                                {Array.isArray(certificateMultiFiles) && certificateMultiFiles.length > 0 ? (
                                    certificateMultiFiles.map((imageUrl, index) => (
                                        <div key={index} className="position-relative d-inline-block me-2">
                                            <img
                                                src={imageUrl}
                                                alt="certificate"
                                                width="100"
                                                height="100"
                                                className="rounded"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                style={{ borderRadius: "50%", padding: "0.2rem 0.5rem" }}
                                                onClick={() => removeCertificateMultiFile(index)}
                                            >
                                                <IoClose />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No certificate images uploaded.</p>
                                )}
                            </div>

                        </div>

                        <div className="col-12 mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary text-uppercase px-3"
                                disabled={isLoading}
                                onClick={handleSubmit(onSubmit)}
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                            <Link
                                to="/astrologer-list"
                                className="btn btn-secondary text-uppercase px-3 mx-2"
                            >
                                Cancel
                            </Link>
                        </div>

                        {/* Modal */}
                        {isOpen && (
                            <>
                                <div className={`modalss ${isOpen ? "show" : ""}`}>
                                    <div className={`modal-contentss ${isOpen ? "show" : ""}`}>
                                        <button className="close-btnss" onClick={closeModal}>
                                            ✖
                                        </button>
                                        <img src={currentImage} alt="Pop-up" />
                                    </div>
                                </div>
                                <div
                                    className={`modal-overlayss ${isOpen ? "show" : ""}`}
                                    onClick={closeModal}
                                ></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AstrolgerAdd;
