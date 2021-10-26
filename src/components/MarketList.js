import React, { useEffect, useState } from "react";
import { Connect } from "aws-amplify-react";
import { listMarkets } from "../graphql/queries";
import { graphqlOperation } from "@aws-amplify/api";
import { Loading, Card, Icon, Tag } from "element-react";
import { Link } from "react-router-dom";
import Error from "./Error";
import MarketLogo from "../assets/market.svg";
import CartLogo from "../assets/shopping-cart.svg";
import { onCreateMarket } from "../graphql/subscriptions";

const MarketList = ({ searchResults }) => {
  const onNewMarket = (prevQuery, newdata) => {
    console.log("prevQuery", prevQuery);
    let updatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newdata.onCreateMarket,
      ...prevQuery.listMarkets.items,
    ];
    updatedQuery.listMarkets.items = updatedMarketList;
    console.log(updatedMarketList.length);
    return updatedQuery;
  };

  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      // state in the subscription of Connect
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listMarkets) return <Loading fullscreen={true} />;
        // Check if there are SearcghedItems (passed from HomePage)
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;
        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length} Results
              </h2>
            ) : (
              <h2 className="header">
                <img src={MarketLogo} alt="" className="large-icon" />
                Markets
              </h2>
            )}
            {markets.map((market) => {
              return (
                <div className="my-2" key={market.id}>
                  <Card
                    bodyStyle={{
                      padding: "0.7em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span className="flex">
                        <Link className="link" to={`/markets/${market.id}`}>
                          {market.name}
                        </Link>
                        <span style={{ color: "var(--darkAmazonOrange)" }}>
                          {market.products === [] ? market.products.items : 0}
                        </span>
                        <img
                          src={CartLogo}
                          alt="Shopping Cart"
                          style={{ height: "20px" }}
                        />
                      </span>
                      <div style={{ color: "var(--lightSquidInk)" }}>
                        {market.owner}
                      </div>
                    </div>
                    <div>
                      {market.tags &&
                        market.tags.map((tag) => (
                          <Tag key={tag} type="danger" className="mx-1">
                            {tag}
                          </Tag>
                        ))}
                    </div>
                  </Card>
                </div>
              );
            })}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
