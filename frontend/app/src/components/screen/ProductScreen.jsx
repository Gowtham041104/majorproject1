import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ProductScreen({ product }) {
  if (!product) return null;  // Safety check

  return (
    <Card className="my-3 p-3 rounded">
      <Link to={`/product/${product._id}`}>
        <Card.Img
          src={product.image}
          variant="top"
          style={{ height: '200px', objectFit: 'contain' }}
        />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
          <div className="my-2">
            {product.rating} stars from {product.numReviews} reviews
          </div>
        </Card.Text>

        <Card.Text as="h6">
          <div className="my-2">$ {product.price}</div>
        </Card.Text>

        <Card.Text as="div">
          <Link to={`/product/${product._id}`} className="btn btn-outline-success btn-sm">
            View More
          </Link>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ProductScreen;
