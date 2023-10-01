import { Route, Routes } from '@solidjs/router';
import type { Component } from 'solid-js';
import Home from "./pages/Home";
import Submit from "./pages/Submit";
import Thanks from './pages/Thanks';

const App: Component = () => {
  return (
    <Routes>
          <Route path="/" component={Home}/>
          <Route path="/submitForm" component={Submit}/>
          <Route path="/thanks" component={Thanks}/>
    </Routes>
  );
};

export default App;
