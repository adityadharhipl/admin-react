import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategory } from "../../Redux/Reducers/CategoryReducer";
import Select from 'react-select';
import { fetchLanguages } from "../../Redux/Reducers/LanguageReducer";
import axios from "axios";
import { uploadImagecertifates } from "../../Redux/Actions/Action";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCourse } from "../../Redux/Reducers/CourseReducer";
import { IoIosCloseCircle } from "react-icons/io";

function CourseAdd(props) {

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [languageData, setLanguagesData] = useState([]);
  const [category, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const course = useSelector((state) => state?.CourseReducer?.course);

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
    if (id) {
      dispatch(fetchCourse(id));
    }
  }, [dispatch, id]);

  

  const [sections, setSections] = useState({
    batchDetails: [
      { batchName: "", hour: "", day: [], batchTitle: "", startTime: "", endTime: "", startDate: "", endDate: "" },
    ],
    learningOutcomes: [""],
    courseContents: [{ cTitle: "", cDescription: "" }],
    programBenefits: [""],
    title: "",
    description: "",
    price: "",
    rPrice: "",
    courseImg: "",
    about: "",
    courseType: "",
    courseVid: "",
    categoryId: "",
    language: [],
    tutorsImage: "",
    tutorsName: "",
    tutorsDesc: "",
    certificateImg: "",
    // progFile: "",
    brochureFile: "",
    steps: props.steps,
    status: props.steps === 8 ? true : false,
  });

  function convert12to24(time12) {
    if (!time12) return "";
    let [time, modifier] = time12.split(" ");
    if (!modifier) return time;

    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (modifier.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  useEffect(() => {
    if (course?.data) {
      setSections((prevSections) => ({
        ...prevSections,
        batchDetails:
          course.data.batchDetails?.map((item) => ({
            batchName: item.batchName,
            batchTitle: item.batchTitle,
            day: item.day,
            hour: item.hour,
            // startTime: item.startTime,
            // endTime: item.endTime,
            startTime: convert12to24(item.startTime),
            endTime: convert12to24(item.endTime),
            startDate: item.startDate,
            endDate: item.endDate,
          })) || prevSections.batchDetails,
        learningOutcomes:
          course.data.learningOutcomes || prevSections.learningOutcomes,
        courseContents:
          course.data.courseContents?.map((item) => ({
            cTitle: item.cTitle,
            cDescription: item.cDescription,
          })) || prevSections.courseContents,
        programBenefits:
          course.data.programBenefits || prevSections.programBenefits,
        title: course.data.title || prevSections.title,
        label: course.data.label || prevSections.label,
        courseType: course.data.courseType || prevSections.courseType,
        language: course.data.language || prevSections.language,
        description: course.data.description || prevSections.description,
        about: course.data.about || prevSections.about,
        categoryId: course?.data?.categoryId?._id || prevSections.categoryId?._id,
        tutorsName: course.data.tutorsName || prevSections.tutorsName,
        tutorsDesc: course.data.tutorsDesc || prevSections.tutorsDesc,
        courseVid: course.data?.courseVid || prevSections.courseVid,
        price: course.data?.price || prevSections.price,
        rPrice: course.data?.rPrice || prevSections.rPrice,
        courseImg: course.data?.courseImg || prevSections.courseImg,
        tutorsImage: course?.data?.tutorsImage || prevSections.tutorsImage,
        certificateImg:
          course.data?.certificateImg || prevSections.certificateImg,
        // progFile: course.data?.progFile || prevSections.progFile,
        brochureFile: course.data?.brochureFile || prevSections.brochureFile,
        status: props.steps === 8 ? true : false,
      }));
    }
  }, [course]);


  const handleLanguageChange = (selectedOptions) => {
    const selectedLanguages = selectedOptions?.map((option) => option?.value);
    setSections((prev) => ({
      ...prev,
      language: selectedLanguages,
    }));
  };

  const languageOptions = languageData?.data?.map((lang) => ({
    value: lang.languageName,
    label: lang.languageName,
  }));

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  const handleImageChange = async (e, fieldName) => {

    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {

        const previewUrl = URL.createObjectURL(file);
        // setCourseImg(previewUrl); 

        // Upload the image
        const imageUrl = await dispatch(uploadImagecertifates(file));
        if (imageUrl) {
          setSections((prevData) => ({
            ...prevData,
            [fieldName]: imageUrl,
          }));
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    } else {
      console.error("Please upload a valid image file.");
    }
  };

  const handleVideoChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      alert("Please upload a valid image or video file.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setSections((prevData) => ({
        ...prevData,
        [fieldName]: previewUrl,
      }));
      const uploadedUrl = await dispatch(uploadImagecertifates(file));

      if (uploadedUrl) {
        setSections((prevData) => ({
          ...prevData,
          [fieldName]: uploadedUrl,
        }));
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload the file. Please try again.");
    }
  };


  const handleBrochureFileChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === "application/pdf") {
      try {

        const fileUrl = await dispatch(uploadImagecertifates(file));
        if (fileUrl) {
          setSections((prevSections) => ({
            ...prevSections,
            brochureFile: fileUrl,
          }));
        }
      } catch (error) {
        alert("Failed to upload the PDF file. Please try again.");
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  };


  useEffect(() => {
    setSections((prevSections) => ({
      ...prevSections,
      steps: props.steps + 1,
    }));
  }, [props.steps]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("User-admin-token");
        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/category`, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);

  const handleAddSection = (sectionName, initialState) => {
    setSections((prev) => ({
      ...prev,
      [sectionName]: [...prev[sectionName], initialState],
    }));
  };

  const handleRemoveSection = (sectionName, index) => {
    setSections((prev) => {
      const sectionArray = prev[sectionName];
      if (Array.isArray(sectionArray)) {
        return {
          ...prev,
          [sectionName]: sectionArray.filter((_, i) => i !== index),
        };
      }
      return prev;
    });
  };

  const isStepOneComplete = () => {
    let errors = [];

    if (String(sections?.title || "")?.trim() === "") errors.push("Course Title");
    if (String(sections?.description || "")?.trim() === "") errors.push("Course Description");
    if (String(sections?.price || "")?.trim() === "") errors.push("Price");
    if (String(sections?.rPrice || "")?.trim() === "") errors.push("Reduced Price");
    if (String(sections?.courseType || "")?.trim() === "") errors.push("Course Type");
    if (String(sections?.about || "")?.trim() === "") errors.push("About");
    if (String(sections?.courseVid || "")?.trim() === "") errors.push("Course Video");
    if (String(sections?.courseImg || "")?.trim() === "") errors.push("Course Image");
    if (
      !sections?.language ||
      sections.language.length === 0 ||
      sections.language.some(lang => String(lang || "")?.trim() === "")
    ) {
      errors.push("Languages");
    }
    if (String(sections?.categoryId || "")?.trim() === "") errors.push("Category");

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const isStepTwoComplete = () => {
    let errors = [];
    sections.batchDetails.forEach((batch, index) => {
      if (batch.batchName?.trim() === "") errors.push(`Batch Name `);
      if (batch.batchTitle?.trim() === "") errors.push(`Batch Title `);
      if (batch.hour?.trim() === "") errors.push(`Hour `);
      if (batch.day.length === 0) errors.push(`Day `);
      if (batch.startTime?.trim() === "") errors.push(`Start Time `);
      if (batch.endTime?.trim() === "") errors.push(`End Time `);
      if (batch.startDate?.trim() === "") errors.push(`Start Date `);
      if (batch.endDate?.trim() === "") errors.push(`End Date `);
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };


  const isStepThreeComplete = () => {
    let errors = [];

    // Validate tutorsImage
    if (!sections.tutorsImage || sections.tutorsImage?.trim() === "") {
      errors.push("Tutor's Image");
    }

    // Validate tutorsName
    if (sections.tutorsName?.trim() === "") {
      errors.push("Tutor's Name");
    }

    // Validate tutorsDesc
    if (sections.tutorsDesc?.trim() === "") {
      errors.push("Tutor's Description");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const isStepFourComplete = () => {
    let errors = [];

    // Validate certificateImg
    if (!sections.certificateImg || sections.certificateImg?.trim() === "") {
      errors.push("Certificate Image");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const isStepFiveComplete = () => {
    let errors = [];
    if (!sections.learningOutcomes || sections.learningOutcomes.length === 0) {
      errors.push("Learning Outcomes");
    } else {
      sections.learningOutcomes.forEach((outcome, index) => {
        if (outcome?.trim() === "") {
          errors.push(`Learning Outcome ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const isStepSixComplete = () => {
    let errors = [];
    if (!sections.courseContents || sections.courseContents.length === 0) {
      errors.push("Course Content");
    } else {
      sections.courseContents.forEach((content, index) => {
        if (!content.cTitle || content.cTitle?.trim() === "") {
          errors.push(`Course Content Title ${index + 1}`);
        }
        if (!content.cDescription || content?.cDescription?.trim() === "") {
          errors.push(`Course Content Description ${index + 1}`);

        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };


  const isStepSevenComplete = () => {
    let errors = [];


    if (!sections?.brochureFile) {
      errors.push("Brochure File");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  const isStepEightComplete = () => {
    let validationErrors = {};

    // Validate programBenefits
    if (sections.programBenefits.length === 0 || sections.programBenefits.some(benefit => benefit?.trim() === "")) {
      validationErrors.programBenefits = "Please enter at least one valid Program Benefit.";
    }
    return Object.keys(validationErrors).length === 0;
  };

  const onNext = (e) => {
    const { isValid, errors } = isStepOneComplete();

    if (props.steps === 0 && !isValid) {
      toast.error(`Please fill in the following fields: ${errors.join(", ")}`);
      return;
    }
    if (props.steps === 1 && !isStepTwoComplete().isValid) {
      toast.error(`Please fill in the following fields: ${isStepTwoComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps === 2 && !isStepThreeComplete().isValid) {
      toast.error(`Please fill in the following fields: ${isStepThreeComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps === 3 && !isStepFourComplete().isValid) {
      toast.error(`Please fill in the following fields: ${isStepFourComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps === 4 && !isStepFiveComplete().isValid) {
      toast.error(`Please fill in the following fields: ${isStepFiveComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps === 5 && !isStepSixComplete().isValid) {
      toast.error(`Please fill in the following fields: ${isStepSixComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps === 6) {
      const stepSevenValidation = isStepSevenComplete();

      if (!stepSevenValidation.isValid) {
        toast.error(`Please fill in the following fields: ${stepSevenValidation.errors.join(", ")}`);
        return;
      }
    }

    if (props.steps === 7 && !isStepEightComplete()?.isValid) {
      toast.error(`Please fill in the following fields: ${isStepEightComplete().errors.join(", ")}`);
      return;
    }
    if (props.steps < 7) {
      props.handleSteps(props.steps + 1);
    }
  };

  const onBack = (e) => {
    e.preventDefault();
    if (props.steps > 0) {
      props.handleSteps(props.steps - 1);
    }
  };


  const myColors = [
    "purple",
    "#785412",
    "#452632",
    "#856325",
    "#963254",
    "#254563",
    "white",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: myColors }],
      [{ background: myColors }],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "image",
    "background",
    "align",
  ];

  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setSections((prevState) => ({
      ...prevState,
      categoryId: selectedCategoryId,
    }));
  };


  const countWords = (text) => {
    return text.trim().split(/\s+/).length;
  };
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 360;


  const validateFields = () => {
    let validationErrors = {};
    if (sections.programBenefits.length === 0 || sections.programBenefits.some(benefit => benefit.trim() === "")) {
      validationErrors.programBenefits = "Please enter at least one valid Program Benefit.";
    }

    // // Store errors in state
    setErrors(validationErrors);


    return Object.keys(validationErrors).length === 0;
  };

  const onSubmit = async (isDraft = false) => {
    try {
      if (!validateFields()) {
        toast.error("Please enter at least one valid Program Benefit...");
        return;
      }
      const token = localStorage.getItem("User-admin-token");
      const url = `${process.env.REACT_APP_BASEURL}/admin/course/`;
      const config = { headers: { Authorization: token } };
      let response;
      const { steps, ...payload } = sections;
      payload.isDraft = isDraft;

      if (id) {
        response = await axios.patch(`${url}${id}`, { ...payload, step: sections?.steps }, config);
      } else {
        response = await axios.post(url, { ...payload, step: sections?.steps }, config);
      }

      if (response.status) {
        toast.success(response.data.message);
        navigate("/course-management");
      }
    } catch (error) {
      console.error("Error adding/updating course:", error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <>
      <div className="card-body cardBody_box">
        {props?.steps === 0 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Course Details Section</h5>
            </div>

            <div className="col-md-4">
              <label className="form-label">Title of the Course</label>
              <span style={{ color: "red" }}>*</span>
              <input
                className="form-control"
                type="text"
                placeholder="Enter course title"
                value={sections.title}
                onChange={(e) => {
                  setSections((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Define Level</label>
              <span style={{ color: "red" }}>*</span>
              <input
                className="form-control"
                type="text"
                placeholder="Enter Define Level"
                value={sections.label}
                onChange={(e) => {
                  setSections((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Sale Price</label>
              <span style={{ color: "red" }}>*</span>
              <input
                className="form-control"
                type="text"
                placeholder="Enter course price"
                value={sections.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setSections((prev) => ({
                      ...prev,
                      price: value,
                    }));
                  }
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="retail-price">
                Retail Price<span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="retail-price"
                className="form-control"
                type="text"
                placeholder="Enter course retail price "
                value={sections.rPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setSections((prev) => ({
                      ...prev,
                      rPrice: value,
                    }));
                  }
                }}
              />
            </div>


            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Category</label>{" "}
                <span className="text-danger">*</span>
                <select
                  className="form-control"
                  value={sections?.categoryId || ''}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select a category</option>
                  {category?.data?.map((cat) => (
                    <option key={cat?._id} value={cat?._id}>
                      {cat?.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Course Type</label>{" "}
                <span className="text-danger">*</span>
                <select
                  className="form-control"
                  value={sections.courseType}
                  onChange={(e) => {
                    setSections((prev) => ({
                      ...prev,
                      courseType: e.target.value,
                    }));
                  }}
                >
                  <option value="">Select a type</option>
                  <option value="webinar">Webinar</option>
                  <option value="live">Live Course</option>
                  <option value="recorded">Pre-Recorded Course</option>
                  <option value="master">Master Class</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Course Overview Video/Image</label>{" "}
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleVideoChange(e, "courseVid")}
                />
              </div>

              {/* Conditional Rendering for Preview */}
              {sections?.courseVid && (
                <div style={{ marginTop: "10px" }}>
                  {sections.courseVid.includes("mp4") ||
                    sections.courseVid.includes("webm") ? (
                    <video width="100%" controls>
                      <source src={sections.courseVid} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={sections.courseVid}
                      alt="Uploaded Preview"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  )}
                </div>
              )}
            </div>


            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Course Overview Image</label>
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "courseImg")}
                />
              </div>

              {sections?.courseImg && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={sections.courseImg}
                    alt="Course Preview"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Available Languages</label>
              <Select
                isMulti
                options={languageOptions}
                value={sections?.language?.map((lang) => ({
                  value: lang,
                  label: lang,
                }))}

                onChange={handleLanguageChange}

                placeholder="Select Languages"
                className="basic-multi-select"
                classNamePrefix="select"
                isClearable={sections?.language?.length > 0}
              />
            </div>


            <div className="col-md-12">
              <label className="form-label">About Course</label>
              <span style={{ color: "red" }}>*</span>
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                value={sections.about}
                onChange={(value) => {
                  setSections((prev) => ({
                    ...prev,
                    about: value,
                  }));
                }}
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Description of the Course</label>
              <span style={{ color: "red" }}>*</span>
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                value={sections.description}
                onChange={(value) => {
                  setSections((prev) => ({
                    ...prev,
                    description: value,
                  }));
                }}
              />
            </div>
          </form>
        )}

        {props?.steps === 1 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Batch Details Section</h5>
            </div>
            {sections?.batchDetails?.map((batch, index) => (
              <div className="d-flex align-items-center gap-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label">Batch Name</label>
                    <span className="text-danger">*</span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Batch Name"
                      value={batch.batchName}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          batchName: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Batch Title</label>
                    <span className="text-danger">*</span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Batch Title"
                      value={batch.batchTitle}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          batchTitle: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Hours</label>
                    <span className="text-danger">*</span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="(in hours)"
                      value={batch.hour}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          const updated = [...sections.batchDetails];
                          updated[index] = {
                            ...updated[index],
                            hour: value,
                          };
                          setSections((prev) => ({
                            ...prev,
                            batchDetails: updated,
                          }));
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Day</label>
                    <span className="text-danger">*</span>
                    <Select
                      options={dayOptions}
                      isMulti
                      isClearable={false}
                      // value={batch?.day?.map(day => ({ value: day, label: day })) || []}

                      value={
                        batch?.day && batch?.day?.length > 0
                          ? batch.day.map((day) => ({ value: day, label: day }))
                          : null
                      }
                      onChange={(selectedOptions) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          day: selectedOptions ? selectedOptions?.map(option => option.value) : [],
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                      placeholder="Select Days"
                      styles={{
                        placeholder: (base) => ({
                          ...base,
                          color: "black",
                        }),
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Start Timings</label>
                    <span style={{ color: "red" }}>*</span>
                    <input
                      className="form-control"
                      type="time"
                      value={batch.startTime}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          startTime: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">End Timings</label>
                    <span style={{ color: "red" }}>*</span>
                    <input
                      className="form-control"
                      type="time"
                      value={batch.endTime}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          endTime: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Start Date</label>
                    <span style={{ color: "red" }}>*</span>
                    <input
                      className="form-control"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={batch.startDate}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          startDate: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">End Date</label>
                    <span style={{ color: "red" }}>*</span>
                    <input
                      className="form-control"
                      type="date"
                      value={batch.endDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const updated = [...sections.batchDetails];
                        updated[index] = {
                          ...updated[index],
                          endDate: e.target.value,
                        };
                        setSections((prev) => ({
                          ...prev,
                          batchDetails: updated,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  {index === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary text-uppercase px-3"
                      onClick={() => handleAddSection("batchDetails", {})}
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger text-uppercase px-3"
                      onClick={() => handleRemoveSection("batchDetails", index)}
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </form>
        )}

        {props?.steps === 2 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">
                Tutor Details Section (To confirm if each batch might have
                different tutor)
              </h5>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Tutor's Image</label>{" "}
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="file"
                  placeholder="Upload Image"
                  onChange={(e) => handleImageChange(e, "tutorsImage")}
                />
              </div>

              {sections?.tutorsImage && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={sections.tutorsImage}
                    alt="Course Preview"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Tutor's name</label>{" "}
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Tutors name"
                  value={sections.tutorsName}
                  onChange={(e) => {
                    setSections((prev) => ({
                      ...prev,
                      tutorsName: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label className="form-label">Tutor Description</label>{" "}
                <span className="text-danger">*</span>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={sections.tutorsDesc}
                  onChange={(value) => {
                    setSections((prev) => ({
                      ...prev,
                      tutorsDesc: value,
                    }));
                  }}
                />
              </div>
            </div>
          </form>
        )}

        {props?.steps === 3 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Certificate Details Section</h5>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label className="form-label">Certificate Overview Image</label>{" "}
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="file"
                  placeholder="Upload Image"
                  onChange={(e) => handleImageChange(e, "certificateImg")}
                />
              </div>
              {sections?.certificateImg && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={sections?.certificateImg}
                    alt="Course Preview"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>
          </form>
        )}

        {props?.steps === 4 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Learning Outcomes Section</h5>
            </div>
            {sections?.learningOutcomes?.map((outcome, index) => (
              <div className="d-flex align-items-end gap-4">
                <div className="row g-4 w-100">
                  <div className="col-md-12">
                    <label className="form-label">What Users Will Learn</label>
                    <span className="text-danger">*</span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="What Users Will Learn"
                      value={outcome}
                      onChange={(e) => {
                        const updated = [...sections.learningOutcomes];
                        updated[index] = e.target.value;
                        setSections((prev) => ({
                          ...prev,
                          learningOutcomes: updated,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  {index === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary text-uppercase px-3"
                      onClick={() => handleAddSection("learningOutcomes", "")}
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger text-uppercase px-3"
                      onClick={() =>
                        handleRemoveSection("learningOutcomes", index)
                      }
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </form>
        )}

        {props?.steps === 5 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Course Content Section</h5>
            </div>

            {sections?.courseContents?.map((course, index) => (
              <div className="d-flex align-items-center gap-4" key={index}>
                <div className="row g-4 w-100">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">Chapter Title</label>{" "}
                      <span className="text-danger">*</span>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Chapter Title"
                        value={course.cTitle}
                        onChange={(e) => {
                          const updated = [...sections.courseContents];
                          updated[index] = {
                            ...updated[index],
                            cTitle: e.target.value,
                          };
                          setSections((prev) => ({
                            ...prev,
                            courseContents: updated,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">Chapter Description</label>{" "}
                      <span className="text-danger">*</span>

                      {/* ReactQuill for Chapter Description */}
                      <ReactQuill
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        value={course.cDescription}
                        onChange={(value) => {
                          // Count the words in the value
                          const currentWordCount = countWords(value);

                          // If the word count exceeds the max limit, truncate the input text
                          if (currentWordCount <= maxWords) {
                            const updated = [...sections.courseContents];
                            updated[index] = {
                              ...updated[index],
                              cDescription: value,
                            };
                            setSections((prev) => ({
                              ...prev,
                              courseContents: updated,
                            }));
                            setWordCount(currentWordCount);
                          } else {
                            // If word count exceeds limit, truncate to last valid word
                            const truncatedValue = value.split(' ').slice(0, maxWords).join(' ');
                            const updated = [...sections.courseContents];
                            updated[index] = {
                              ...updated[index],
                              cDescription: truncatedValue,
                            };
                            setSections((prev) => ({
                              ...prev,
                              courseContents: updated,
                            }));
                            setWordCount(maxWords);
                          }
                        }}
                      />


                      {/* Display Word Count */}
                      <div style={{ fontSize: '14px', color: wordCount > maxWords ? 'red' : 'black' }}>
                        {wordCount}/{maxWords} words
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {index === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary text-uppercase px-3"
                      onClick={() => handleAddSection("courseContents", "")}
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger text-uppercase px-3"
                      onClick={() => handleRemoveSection("courseContents", index)}
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </form>
        )}

        {props?.steps === 6 && (
          <form className="row g-4">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Brochure File</label>{" "}
                <span className="text-danger">*</span>
                <input
                  className="form-control"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleBrochureFileChange(e, "brochureFile")}
                />
              </div>


              {sections?.brochureFile && (
                <a
                  href={sections.brochureFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", marginTop: "10px" }}
                >
                  Download Brochure
                </a>
              )}
            </div>

          </form>
        )}

        {props?.steps === 7 && (
          <form className="row g-4">
            <div className="col-md-12">
              <h5 className="fw-bold mb-0">Program Benefits Section</h5>
            </div>

            {sections?.programBenefits?.map((benefit, index) => (
              <div className="col-md-12">
                <div className="d-flex align-items-end gap-4 ">
                  <div className="form-group w-100">
                    <label className="form-label">Benefit Point</label>{" "}
                    <span className="text-danger">*</span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Benefit Point"
                      value={benefit}
                      onChange={(e) => {
                        const updated = [...sections.programBenefits];
                        updated[index] = e.target.value;
                        setSections((prev) => ({
                          ...prev,
                          programBenefits: updated,
                        }));
                      }}
                    />
                  </div>
                  <div>
                    {index === 0 ? (
                      <button
                        type="button"
                        className="btn btn-primary text-uppercase px-3"
                        onClick={() => handleAddSection("programBenefits", "")}
                      >
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger text-uppercase px-3"
                        onClick={() =>
                          handleRemoveSection("programBenefits", index)
                        }
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </form>
        )}

        <div className="col-12 mt-4">
          <div className="d-flex align-items-center justify-content-between">
            <button
              onClick={onBack}
              className="btn btn-secondary text-uppercase px-3"
            >
              {props?.steps === 0 ? "Cancel" : "Back"}
            </button>
            <div className="d-flex align-items-center gap-2">
              {props?.steps < 7 && <button type="submit" className="btn btn-primary text-uppercase px-3" onClick={() => onSubmit(true)}>
                Save as Draft
              </button>}
              <button
                onClick={() => {
                  if (props?.steps === 7) {
                    onSubmit(false);
                  } else {
                    onNext();
                  }
                }}
                type="submit"
                className="btn btn-primary text-uppercase px-3"
              >
                {props.steps === 7 ? "Save" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseAdd;