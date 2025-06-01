import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../actions/userActions";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Message from "../Message";
import Loader from "../Loader";

function LoginScreen() {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && !error) {
      setSuccessMessage("Login successful!");

      // Reset form
      setFormValues({ email: "", password: "" });

      // Redirect after 4 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate(redirect);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [navigate, userInfo, error, redirect]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "password":
        if (!value.trim()) error = "Password is required";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const isFormValid = () => {
    return (
      Object.values(formErrors).every((err) => !err) &&
      formValues.email.trim() &&
      formValues.password.trim()
    );
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (isFormValid()) {
      setMessage(null);
      dispatch(login(formValues.email, formValues.password));
    } else {
      setMessage("Please fill in all fields correctly.");
    }
  };
    useEffect(()=>{
      if(userInfo){
       navigate("/")
      }
    },[userInfo,redirect])

  return (
    <Container>
      <Row>
        <Col md={3}></Col>
        <Col md={6}>
          <Form onSubmit={submitHandler}>
            <br />
            <h5 className="text-center text-dark-bold">Login Here</h5>

            {message && <Message variant="danger">{message}</Message>}
            {error && <Message variant="danger">{error}</Message>}
            {successMessage && (
              <Message variant="success">{successMessage}</Message>
            )}
            {loading && <Loader />}

            <Form.Group controlId="email" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
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
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                isInvalid={!!formErrors.password}
                isValid={formValues.password && !formErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-center mt-3">
              <span>New user?</span>{" "}
              <Link to="/signup" style={{ fontWeight: "bold" }}>
                Sign up
              </Link>
            </div>

            <Button
              className="mt-4 mb-4 w-100"
              variant="primary"
              disabled={!isFormValid()}
              type="submit"
            >
              Login
            </Button>
          </Form>
        </Col>
        <Col md={3}></Col>
      </Row>
    </Container>
  );
}

export default LoginScreen;
