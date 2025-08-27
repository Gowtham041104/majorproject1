import React from "react";
import { Navbar, Container, Nav, NavDropdown, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Loader from "./Loader";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import { useNavigate } from "react-router-dom";
function Header() {

  const userLogin = useSelector((state)=>state.userLogin);
  const {userInfo}=userLogin;
  const cart = useSelector((state)=> state.cart || { cartItems: [] });
  const cartCount = (cart.cartItems || []).reduce((sum, item) => sum + (item.qty || 0), 0);
  const dispatch=useDispatch();
  const navigate = useNavigate();

  const logoutHandler=()=>{
    dispatch(logout());
    navigate('/login')
  }
  return (
    <>
      <Navbar bg="dark" variant="dark" collapseOnSelect>
        <Container>
          <LinkContainer to="/home">
            <Navbar.Brand>Ecommerce Page </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/home">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
             
              
              <LinkContainer to="/cart">
                <Nav.Link>
                  Cart {cartCount > 0 && (<Badge bg="warning" text="dark">{cartCount}</Badge>)}
                </Nav.Link>
              </LinkContainer>
                            <LinkContainer to="/checkout">
                <Nav.Link>Checkout</Nav.Link>
              </LinkContainer>
                    
{userInfo ? (
  <li className="nav-item dropdown">
    <Nav.Link
      className="nav-link dropdown-toggle"
      data-bs-toggle="dropdown"
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
    >
      Welcome {userInfo.name}
    </Nav.Link>
    <div className="dropdown-menu">
      <LinkContainer to="/profile">
        <Nav.Link className="dropdown-item text-dark">Profile</Nav.Link>
      </LinkContainer>
      <Nav.Link className="dropdown-item text-dark" onClick={logoutHandler}>
        Logout
      </Nav.Link>
    </div>
  </li>
) : (
  <>
    <li className="nav-item">
      <LinkContainer to="/signup">
        <Nav.Link>Signup</Nav.Link>
      </LinkContainer>
    </li>
    <li className="nav-item">
      <LinkContainer to="/login">
        <Nav.Link>Login</Nav.Link>
      </LinkContainer>
    </li>
  </>
)}
         
{userInfo && userInfo.isAdmin && (
                                <NavDropdown title='Admin' id='adminmenue'>
                                    <LinkContainer to='/admin/userlist'>
                                        <NavDropdown.Item>Users</NavDropdown.Item>
                                    </LinkContainer>

                                    <LinkContainer to='/admin/productList'>
                                        <NavDropdown.Item>Products</NavDropdown.Item>
                                    </LinkContainer>

                                    <LinkContainer to='/admin/orderlist'>
                                        <NavDropdown.Item>Orders</NavDropdown.Item>
                                    </LinkContainer>

                                </NavDropdown>
                            )}




              
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
