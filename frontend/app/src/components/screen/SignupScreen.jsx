import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signup } from "../../actions/userActions";
import Loader from "../Loader";
import Message from "../Message";

function SignupScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const redirect = location.search ? location.search.split("=")[1] : "/login";

  const userSignup = useSelector((state) => state.userSignup);
  const { loading, error, userInfo } = userSignup;

  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userInfo && !error) {
      setSuccessMessage("Signup successful! Redirecting...");
      setFormValues({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmpassword: "",
        termsAccepted: false,
      });
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate(redirect);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, userInfo, error, redirect]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstname":
      case "lastname":
        if (!value.trim()) error = "This field is required";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "confirmpassword":
        if (value !== formValues.password) error = "Passwords do not match";
        break;
      case "termsAccepted":
        if (!value) error = "You must accept the terms";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "firstname",
      "lastname",
      "email",
      "password",
      "confirmpassword",
      "termsAccepted",
    ];

    return requiredFields.every(
      (field) => !validateField(field, formValues[field])
    );
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setMessage(null);
      dispatch(
        signup(
          formValues.firstname,
          formValues.lastname,
          formValues.email,
          formValues.password
        )
      );
    } else {
      setMessage("Please fix the errors in the form.");
    }
  };

  useEffect(()=>{
    if(userInfo){
      setMessage(userInfo["details"])
    }
    localStorage.removeItem('userInfo')
  },[userInfo])

  return (
    <Container>
      <Row>
        <Col md={3}></Col>
        <Col md={6}>
          <Form onSubmit={submitHandler}>
            <h3 className="text-center mt-4">Signup Here</h3>

            {message && <Message variant="danger">{message}</Message>}
            {error && <Message variant="danger">{error}</Message>}
            {successMessage && (
              <Message variant="success">{successMessage}</Message>
            )}
            {loading && <Loader />}

            <Form.Group controlId="firstname" className="mt-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={formValues.firstname}
                onChange={handleChange}
                isInvalid={!!formErrors.firstname}
                isValid={formValues.firstname && !formErrors.firstname}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.firstname}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="lastname" className="mt-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={formValues.lastname}
                onChange={handleChange}
                isInvalid={!!formErrors.lastname}
                isValid={formValues.lastname && !formErrors.lastname}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.lastname}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="email" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
                isValid={formValues.email && !formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formValues.password}
                  onChange={handleChange}
                  isInvalid={!!formErrors.password}
                  isValid={formValues.password && !formErrors.password}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <i
                    className={`fa ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {formErrors.password}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="confirmpassword" className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="confirmpassword"
                  placeholder="Confirm your password"
                  value={formValues.confirmpassword}
                  onChange={handleChange}
                  isInvalid={!!formErrors.confirmpassword}
                  isValid={
                    formValues.confirmpassword &&
                    !formErrors.confirmpassword &&
                    formValues.confirmpassword === formValues.password
                  }
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <i
                    className={`fa ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {formErrors.confirmpassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mt-3 mb-3">
              <Form.Check
                type="checkbox"
                label="I agree to the terms and conditions"
                name="termsAccepted"
                checked={formValues.termsAccepted}
                onChange={handleChange}
                isInvalid={!!formErrors.termsAccepted}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.termsAccepted}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-center mb-3">
              <span>Already have an account? </span>
              <Link to="/login" style={{ fontWeight: "bold" }}>
                Login
              </Link>
            </div>

            <Button
              variant="success"
              type="submit"
              disabled={!isFormValid()}
              className="w-100 mb-4"
            >
              Sign up
            </Button>
          </Form>
        </Col>
        <Col md={3}></Col>
      </Row>
    </Container>
  );
}

export default SignupScreen;
