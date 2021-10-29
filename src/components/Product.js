import React from "react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { S3Image } from "aws-amplify-react";
import { convertCentsToDollars, convertDollarsToCents } from "../utils";
import { UserContext } from "../App";
import PayButton from "./PayButton";
import EmailedIcon from "../assets/emailed.svg";
import ShippedIcon from "../assets/shipped.svg";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

class Product extends React.Component {
  state = {
    updateProductDialog: false,
    deleteProductDialog: false,
    description: "",
    price: "",
    shipped: false,
  };

  handleUpdateProduct = async (productId) => {
    console.log(productId);
    try {
      this.setState({ updateProductDialog: false });
      const { description, price, shipped } = this.state;
      const input = {
        id: productId,
        description,
        shipped,
        price: convertDollarsToCents(price),
      };
      console.log(input);
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        type: "success",
        message: "Product Successfully updated",
        duration: 2000,
      });
      // reload the page
      // setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  handleDeleteProduct = async (productId) => {
    try {
      this.setState({ deleteProductDialog: false });
      const input = {
        id: productId,
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: "Success",
        type: "success",
        message: "Product Successfully deleted",
        duration: 2000,
      });
      // reload the page
      // setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(`Failed to delete product with id ${productId}`, error);
    }
  };
  render() {
    const { product } = this.props;
    const {
      updateProductDialog,
      description,
      price,
      shipped,
      deleteProductDialog,
    } = this.state;
    return (
      <UserContext.Consumer>
        {({ user }) => {
          const isProductOwner = user && user.attributes.sub === product.owner;
          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: {
                      maxWidth: "100%",
                      maxHeight: "100%",
                    },
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="items-center">
                    <img
                      src={product.shipped ? ShippedIcon : EmailedIcon}
                      alt="Shipping Icon"
                      className="icon shipping-icon"
                    />
                    {product.shipped ? "Shipped" : "Emailed"}
                  </div>
                  <div className="text-right">
                    <span className="mx-1">
                      ${convertCentsToDollars(product.price)}
                    </span>
                    {!isProductOwner && <PayButton />}
                  </div>
                </div>
              </Card>
              {/* Update / delete Porduct Buttons */}
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      className="m-1"
                      onClick={() =>
                        this.setState({
                          updateProductDialog: true,
                          description: product.description,
                          shipped: product.shipped,
                          price: convertCentsToDollars(product.price),
                        })
                      }
                    />
                    {/* --------------------- */}
                    {/* Delete product Dialog */}
                    {/* --------------------- */}
                    <Popover
                      placement="top"
                      width="160"
                      trigger="click"
                      visible={deleteProductDialog}
                      content={
                        <>
                          <p>Dp you want to delete this product?</p>
                          <div className="text-right">
                            <Button
                              size="mini"
                              type="text"
                              className="m-1"
                              onClick={() =>
                                this.setState({ deleteProductDialog: false })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              size="mini"
                              className="m-1"
                              onClick={() =>
                                this.handleDeleteProduct(product.id)
                              }
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        type="danger"
                        icon="delete"
                        onClick={() =>
                          this.setState({ deleteProductDialog: true })
                        }
                      />
                    </Popover>
                  </>
                )}
              </div>
              {/* --------------------- */}
              {/* Update product Dialog */}
              {/* --------------------- */}
              <Dialog
                title="Update product"
                size="large"
                customClass="dialog"
                visible={updateProductDialog}
                onCancel={() =>
                  this.setState({
                    updateProductDialog: false,
                  })
                }
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Update Description">
                      <Input
                        icon="information"
                        trim={true}
                        placeholder="Description"
                        value={description}
                        onChange={(description) =>
                          this.setState({ description })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Update Price">
                      <Input
                        type="number"
                        icon="plus"
                        placeholder="Price ($USD)"
                        value={price}
                        onChange={(price) => this.setState({ price })}
                      />
                    </Form.Item>
                    <Form.Item label="Update Shipping">
                      <div className="text-center">
                        <Radio
                          value="true"
                          checked={shipped === true}
                          onChange={() => this.setState({ shipped: true })}
                        >
                          Shipped
                        </Radio>
                        <Radio
                          value="false"
                          checked={shipped === false}
                          onChange={() => this.setState({ shipped: false })}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updateProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
