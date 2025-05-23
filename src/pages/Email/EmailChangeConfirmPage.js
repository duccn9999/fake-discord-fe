import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useJwtDecode from "../../hooks/jwtDecode";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import COMMON from "../../utils/Common";
import { save } from "../../reducers/tokenReducer";
export function EmailConfirmPage() {
  const navigate = useNavigate();
  const {email} = useParams();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2 className="textFaded">Your email {email} has been successfully changed!</h2>
        <button
          className="btn bgPrimary textFaded"
          style={{ marginTop: 24, padding: "12px 32px", fontSize: "1.1rem" }}
          onClick={() => navigate("/")}
        >
          Go to Home Page
        </button>


    </div>
  );
}

export default EmailConfirmPage;
