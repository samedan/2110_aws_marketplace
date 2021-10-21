import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { i18n } from "element-react";
import locale from "element-react/src/locale/lang/en";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { UserContext } from "../App";

i18n.use(locale);

class NewMarket extends React.Component {
  state = {
    addMarketDialog: false,
    name: "",
    tags: ["Arts", "Technology", "Crafts", "Entertainment", "Web Dev"],
    selectedTags: [],
    options: [],
  };

  handleAddMarket = async (user) => {
    try {
      this.setState({ addMarketDialog: false });
      const input = {
        name: this.state.name,
        // user comes from the Context provider of App.js
        owner: user.username,
        tags: this.state.selectedTags,
      };
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.log(result);
      console.info(`Created Market id: ${result.data.createMarket.id}`);
      this.setState({ name: "", selectedTags: [] });
    } catch (error) {
      console.error("Error adding new Markets", error);
      Notification.error({
        title: "Error",
        message: `${error.message || "Error adding Market"}`,
      });
    }
  };

  handleFilterTags = (query) => {
    // create ALL the options in select
    const options = this.state.tags
      .map((tag) => ({ value: tag, label: tag }))
      // filer only the options selected in teh form
      .filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };

  getAvailableTags() {
    // const availableTags = this.state.tags.map((tag) => availableTags.join(tag));
    return this.state.tags.toString();
  }

  render() {
    // {
    //   const availableTags = this.state.tags.map((tag) => tag).toString();
    //   console.log(availableTags);
    // }
    return (
      <UserContext.Consumer>
        {// acces 'value'
        ({ user }) => (
          <>
            <div className="market-header">
              <h1 className="market-title">
                Create your MarketPlace
                <Button
                  onClick={() => this.setState({ addMarketDialog: true })}
                  type="text"
                  icon="edit"
                  className="market-title-button"
                />
              </h1>
            </div>
            <Dialog
              title="Create New Market"
              visible={this.state.addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size="large"
              customClass="dialog"
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item lable="Add Market Name">
                    <Input
                      placeholder="Market Name"
                      trim={true}
                      onChange={(name) => this.setState({ name })}
                      value={this.state.name}
                    />
                  </Form.Item>
                  <Form.Item label={`Add Tags: ${this.getAvailableTags()}`}>
                    <Select
                      multiple={true}
                      filterable={true}
                      placeholder="Market Tags"
                      onChange={(selectedTags) =>
                        this.setState({ selectedTags })
                      }
                      remoteMethod={this.handleFilterTags}
                      remote={true}
                    >
                      {this.state.options.map((option) => (
                        <Select.Option
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.handleAddMarket(user)}
                  disabled={!this.state.name}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default NewMarket;
