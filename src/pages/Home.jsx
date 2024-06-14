import React, { useEffect } from "react";
import withAuth from "../components/withAuth";
import { useMetaMask } from "../hooks/useMetaMask";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import "./Home.module.css";
import { useState } from "react";

const Home = () => {
  const [images, setImages] = useState([]);
  const { wallet, hasProvider, isSigning, isConnecting, connectMetaMask } =
    useMetaMask();
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/static/images");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Ошибка при получении изображений:", error);
      }
    };

    fetchImages();
  }, []);
  return (
    <Container className="home-container">
      <Row className="my-5">
        <Col>
          <h1 className="text-center">
            Добро пожаловать в систему электронных голосований с использованием
            технологии блокчейн
          </h1>
          <p className="text-center">
            Эта система обеспечивает безопасное, прозрачное и децентрализованное
            голосование, используя передовые технологии блокчейн.
          </p>
        </Col>
      </Row>
      <Row className="my-5">
        <Col md={4}>
          <Card bg="dark" text="light">
            <Card.Body>
              <Card.Img
                variant="top"
                src={`http://localhost:5000/static/images/sec.jpg`}
              />
              <Card.Title className="mt-3">Безопасность</Card.Title>
              <Card.Text>
                Использование блокчейн обеспечивает высочайший уровень
                безопасности, предотвращая возможность подделки голосов.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="dark" text="light">
            <Card.Body>
              <Card.Img
                variant="top"
                src={`http://localhost:5000/static/images/inv.png`}
              />
              <Card.Title className="mt-3">Прозрачность</Card.Title>
              <Card.Text>
                Все голосования открыты и прозрачны, любой может проверить
                результаты в любое время.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="dark" text="light">
            <Card.Body>
              <Card.Img
                variant="top"
                src={`http://localhost:5000/static/images/dec.webp`}
              />
              <Card.Title className="mt-3">Децентрализация</Card.Title>
              <Card.Text>
                Система работает без центрального органа управления, обеспечивая
                справедливость и независимость голосования.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="my-5">
        <Col md={6} style={{ width: "35%" }}>
          <Card bg="dark" text="light">
            <Card.Body>
              <Card.Img
                variant="top"
                src={`http://localhost:5000/static/images/logo.jpg`}
              />
              <Card.Title className="mt-3">Как это работает?</Card.Title>
              <Card.Text>
                Наше приложение позволяет пользователям создавать голосования,
                участвовать в них и отслеживать результаты в реальном времени.
              </Card.Text>
              <Card.Text>
                Чтобы начать, просто подключите ваш MetaMask кошелек и выберите
                голосование, в котором хотите участвовать.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card bg="dark" text="light">
            {1 > 0 ? (
              <Card.Body>
                <Card.Title className="mt-3">Голосуйте</Card.Title>
                <Card.Text>
                  Вы успешно подключили ваш MetaMask кошелек для участия в
                  голосованиях. Перейдите на{" "}
                  <Link to="/voting" style={{ textDecoration: "none" }}>
                    эту
                  </Link>{" "}
                  страницу чтобы начать голосовать, или создать голосование.
                </Card.Text>
                <Link to="/create">
                  <button variant="primary">Создать голосование</button>
                </Link>
              </Card.Body>
            ) : (
              <Card.Body>
                <Card.Title className="mt-3">Подключитесь сейчас</Card.Title>
                <Card.Text>
                  Подключите ваш MetaMask кошелек для участия в голосованиях.
                  Если у вас еще нет кошелька, вы можете установить MetaMask с
                  официального сайта.
                </Card.Text>
                <button variant="primary" onClick={connectMetaMask}>
                  Подключить MetaMask
                </button>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
