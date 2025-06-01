import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const stepStyle = {
    display: 'inline-block',
    minWidth: '120px',
    padding: '10px 15px',
    marginRight: '10px',
    borderRadius: '5px',
    textAlign: 'center',
    fontSize: '16px',
    textDecoration: 'none',
  };

  const activeStyle = {
    ...stepStyle,
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
  };

  const completedStyle = {
    ...stepStyle,
    backgroundColor: '#28a745',
    color: 'white',
  };

  const disabledStyle = {
    ...stepStyle,
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    cursor: 'not-allowed',
  };

  return (
    <div className="mb-4 text-center">
      {step1 ? (
        <Link to="/login" style={completedStyle}>Login</Link>
      ) : (
        <span style={disabledStyle}>Login</span>
      )}

      {step2 ? (
        <Link to="/checkout" style={completedStyle}>Shipping</Link>  
      ) : (
        <span style={disabledStyle}>Shipping</span>
      )}

      {step3 ? (
        <Link to="/payment" style={completedStyle}>Payment</Link>
      ) : (
        <span style={disabledStyle}>Payment</span>
      )}

      {step4 ? (
        <Link to="/placeorder" style={activeStyle}>Place Order</Link>
      ) : (
        <span style={disabledStyle}>Place Order</span>
      )}
    </div>
  );
};

export default CheckoutSteps;
