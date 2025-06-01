import React, { useEffect, useState } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../Loader'
import Message from '../Message'
import { listProducts, createProduct, deleteProduct } from '../../actions/ProductAction'
import { PRODUCT_CREATE_RESET } from '../../constants/productConstants'
import { useNavigate } from 'react-router-dom'

function ProductListScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)

  // Product list from Redux store
  const productsList = useSelector(state => state.productsList)
  const { loading, error, products = [] } = productsList || {}

  // Product delete state
  const productDelete = useSelector(state => state.productDelete)
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete

  // Product create state
  const productCreate = useSelector(state => state.productCreate)
  const { loading: loadingCreate, error: errorCreate, success: successCreate, product: createdProduct } = productCreate

  // User login state
  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  // Reset product create state and handle redirects
  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login')
    }

    if (successCreate && createdProduct && (createdProduct._id || createdProduct.id)) {
      const productId = createdProduct._id || createdProduct.id
      navigate(`/admin/product/${productId}/edit`)
    } else {
      dispatch(listProducts())
    }
  }, [dispatch, userInfo, navigate, successDelete, successCreate, createdProduct])

  const createProductHandler = () => {
    dispatch(createProduct())
  }

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
    }
  }

  const handleClose = () => setMessage(null)

  useEffect(() => {
    console.log('Products:', products)
  }, [products])

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-right'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Create Product
          </Button>
        </Col>
      </Row>

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger' onClose={handleClose}>{errorDelete}</Message>}

      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger' onClose={handleClose}>{errorCreate}</Message>}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger' onClose={handleClose}>{error}</Message>
      ) : products.length === 0 ? (
        <Message>No products found</Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              // Use _id or id for key & navigation, skip if missing
              const productId = product._id || product.id
              if (!productId || !product.name) return null

              return (
                <tr key={productId}>
                  <td>{productId}</td>
                  <td>{product.name}</td>
                  <td>Rs. {product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${productId}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(productId)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default ProductListScreen
