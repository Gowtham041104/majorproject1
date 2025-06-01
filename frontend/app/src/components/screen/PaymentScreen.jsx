import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../../actions/cartActions';

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <form onSubmit={submitHandler}>
      <div>
        <input
          type="radio"
          id="cod"
          name="paymentMethod"
          value="CashOnDelivery"
          checked={paymentMethod === 'CashOnDelivery'}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        <label htmlFor="cod">Cash On Delivery</label>
      </div>
      <button type="submit">Continue</button>
    </form>
  );
};

export default PaymentScreen;
