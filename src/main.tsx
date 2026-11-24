import { mount } from "./components/mount";
import { MainApp } from "./app/MainApp";
import "./styles/base.css";
mount(<MainApp pathname={window.location.pathname} />);
