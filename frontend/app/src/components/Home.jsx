import React, { useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/ProductAction';
import ProductScreen from './screen/ProductScreen'; // adjust path if needed
import Loader from './Loader';

function Home() {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList) || {};
  const { loading = true, error = null, products = [] } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center my-5">{error}</Alert>;
  }

  return (
    <div>
      <h1 className="text-center mt-2">Latest Products</h1>
      {loading ? (
        <Loader/>

      ): (
      <Row>
        {products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} >
            <ProductScreen product={product} />
          </Col>
        ))}
      </Row>
      )}
    </div>
  );
}

export default Home;
