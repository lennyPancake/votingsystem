import React, { useState } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import { Form, Container, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import withAuth from "../components/withAuth";
import style from "./Create.module.css";

const CreateVotingForm = () => {
  const [votingName, setVotingName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([]);
  const [optionText, setOptionText] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revealed, setRevelead] = useState(false);

  const handleOptionChange = (e, index) => {
    const updatedOptions = [...options];
    updatedOptions[index] = e.target.value;
    setOptions(updatedOptions);
  };

  const addOption = (e) => {
    e.preventDefault();
    if (optionText.trim() !== "") {
      setOptions((prevOptions) => [...prevOptions, optionText]);
      setOptionText("");
    }
  };

  const createVoting = async (e) => {
    e.preventDefault();
    let finalOptions = options;
    if (optionText.trim() !== "") {
      finalOptions = [...options, optionText];
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      const endDateInSeconds = Math.floor(new Date(endDate).getTime() / 1000);
      console.log("Передаваемые варианты:", finalOptions);
      await contractInstance.methods
        .createVoting(
          votingName,
          description,
          finalOptions,
          revealed,
          endDateInSeconds
        )
        .send({ from: accounts[0] });
      console.log("Голосование успешно создано!");
    } catch (error) {
      console.error("Ошибка при создании голосования", error);
    }
  };

  return (
    <Container className={style.main}>
      <h2 className="my-4">Создать голосование</h2>
      <Form onSubmit={createVoting}>
        <Form.Group controlId="votingName">
          <Form.Label>Название голосования</Form.Label>
          <Form.Control
            type="text"
            value={votingName}
            onChange={(e) => setVotingName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="description" className="mt-3">
          <Form.Label>Описание голосования</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="options" className="mt-3">
          <Form.Label>Варианты ответа</Form.Label>
          {options.map((option, index) => (
            <InputGroup className="mb-2" key={index}>
              <Form.Control
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(e, index)}
              />
            </InputGroup>
          ))}
          <InputGroup className="mb-2">
            <Form.Control
              type="text"
              value={optionText}
              onChange={(e) => setOptionText(e.target.value)}
              placeholder="Новый вариант"
            />
            <button style={{ marginLeft: "10px" }} onClick={addOption}>
              Добавить вариант
            </button>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="endDate" className="mt-3">
          <Form.Label>Дата завершения</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Form.Check
            type="switch"
            id="disabled-custom-switch"
            label="Показывать результаты"
            checked={revealed}
            onChange={(e) => {
              setRevelead(e.target.checked);
            }}
          />
        </Form.Group>

        <button type="submit">Создать голосование</button>
      </Form>
    </Container>
  );
};

export default withAuth(CreateVotingForm);
