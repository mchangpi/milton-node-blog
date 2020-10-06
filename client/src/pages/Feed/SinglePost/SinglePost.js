import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `
			  query GetPost($postId: ID!){
					getPost(id: $postId){
						title content imageUrl creator { name } createdAt
					}
				}`,
      variables: { postId: postId },
    };
    fetch(process.env.REACT_APP_SERVER + "/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.errors)
          throw new Error("Fetching post failed. " + res.errors[0].message);
        //console.log("resp ", res);
        this.setState({
          title: res.data.getPost.title,
          author: res.data.getPost.creator.name,
          image: process.env.REACT_APP_SERVER + "/" + res.data.getPost.imageUrl,
          date: new Date(res.data.getPost.createdAt).toLocaleDateString("zh"),
          content: res.data.getPost.content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
