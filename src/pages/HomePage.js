import React from "react";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../graphql/queries";

class HomePage extends React.Component {
  state = {
    searchTerm: "",
    searchResults: [],
    isSearching: false,
  };

  handleSearchChange = (searchTerm) => this.setState({ searchTerm });

  handleClearSearch = () => {
    console.log("handleClearSearch");
    this.setState({ searchTerm: "", searchResults: [] });
  };

  handleSearch = async (event) => {
    event.preventDefault();
    try {
      this.setState({ isSearching: true });
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: this.state.searchTerm } },
              { owner: { match: this.state.searchTerm } },
              { tags: { match: this.state.searchTerm } },
            ],
          },
          sort: {
            field: "createdAt",
            direction: "desc",
          },
        })
      );
      console.log({ result });
      this.setState({
        searchResults: result.data.searchMarkets.items,
        isSearching: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <>
        <NewMarket
          searchTerm={this.state.searchTerm}
          isSearching={this.isSearching}
          handleSearchChange={this.handleSearchChange}
          handleClearSearch={this.handleClearSearch}
          handleSearch={this.handleSearch}
        />
        <MarketList
          searchResults={this.state.searchResults}
          searchTerm={this.state.searchTerm}
        />
      </>
    );
  }
}

export default HomePage;
