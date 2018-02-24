import './styles.scss';


import 'prismjs';
import CodeFlask from 'codeflask';
import RandExp from 'randexp';
import io from 'socket.io-client';

document.addEventListener('DOMContentLoaded', e => {

  localStorage.clear();

  const socket = io('http://localhost:6969');
  const ROUTE = {};

  //----------------START json-editor

  Object.defineProperty(JSON, 'prettyPrint', {
    configurable: false,
    enumerable: false,
    value: obj => JSON.stringify(obj, null, '\t'),
    writable: false
  });

  const DEFAULT_CODE_STR = () => `{
    "who": "you",
    "what": "write/paste/edit & serve your JSONs on custom routes in real-time",
    "why": "save time while testing or prototyping",
    "where": "go to ${window.location.origin}/_",
    "when": "${Date.now() % 2 ? 'time is always right to do what is right - Martin Luther King, Jr.' : 'you may delay, but time will not - Benjamin Franklin' }"
}`

  let codeStr = DEFAULT_CODE_STR();
  ROUTE.json = codeStr;

  const FLASK = new CodeFlask;
  FLASK.indent   = '\t';
  FLASK.selector = '#json-editor';
  FLASK.element  = document.querySelector(FLASK.selector);

  FLASK.run(FLASK.selector, { language: 'javascript' });
  FLASK.update(JSON.prettyPrint(JSON.parse(codeStr)));

  FLASK.onUpdate(code => {
    codeStr = code;

    if (codeStr.length === 0) {
      codeStr = DEFAULT_CODE_STR();
      FLASK.update(codeStr);

    } else {
      try {
        JSON.parse(codeStr);
        FLASK.element.classList.remove('invalid-json');

        ROUTE.json = codeStr;
        socket.connected ? socket.emit('route', ROUTE) : null;

      } catch (e) {
        FLASK.element.classList.add('invalid-json');
      }
    }
  }); // FLASK.onUpdate(...)

  FLASK.textarea.addEventListener('paste', e => {
    window.setTimeout(() => {
      // this will run after 'onUpdate'
      try {
        FLASK.update(JSON.prettyPrint(JSON.parse(codeStr)));

      } catch (e) {
        alert('You pasted an invalid JSON');
      }
    }, 0);
  }); // FLASK.textarea.addEventListener('paste', ...)

  //----------------END json-editor

  //----------------START routes

  [...document.querySelectorAll('.route .path .origin')].forEach(el => el.textContent = window.location.origin);

  populateRoutesExamples(10);

  [...document.querySelectorAll('.route .path input')].forEach(el => {
    el.addEventListener('input', e => {
      if (el.value.length === 0 || (el.value.length > 0 && el.value[0] !== '/')) {
        el.value = `/${el.value}`
      }
      while (el.value[1] === '_') { el.value = `/${el.value.substr(2)}` }
      populateRoutesExamples(10);
    });
  });

  function populateRoutesExamples(howManyExamples) {
    [...document.querySelectorAll('.route .path input')].forEach(el => {
      try {
        el.classList.remove('invalid-regexp');

        const exampleEl = el.parentElement.nextElementSibling;
        while (exampleEl.firstChild) { exampleEl.removeChild(exampleEl.firstChild) };

        const regexp = new RegExp(`^${el.value.substr(1)}$`, 'g');

        const exampleArr = [];
        [...Array(howManyExamples).keys()].forEach((x, i) => {
          const url = `${window.location.origin}/${new RandExp(regexp).gen()}`;
          if (!exampleArr.includes(url)) { exampleArr.push(url) } else { return };
          const link = document.createElement('a');
          link.setAttribute('target', 'blank');
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('href', url);
          link.textContent = url
          exampleEl.appendChild(link);
        });

        ROUTE.regexp = el.value.substr(1);
        socket.connected ? socket.emit('route', ROUTE) : null;

        // let routes = localStorage.getItem('routes');
        // if (routes) {
        //   routes = JSON.parse(routes);
        //   // routes.push({
        //   //   regexp: regexp.toString(),
        //   //   json: codeStr
        //   // });
        //   routes = [{
        //     regexp: regexp.toString(),
        //     json: codeStr
        //   }];
        // } else {
        //   routes = [{
        //     regexp: regexp.toString(),
        //     json: codeStr
        //   }];
        // }
        // localStorage.setItem('routes', JSON.stringify(routes));

      } catch (e) {
        // console.log('Invalid RegExp', e);
        el.classList.add('invalid-regexp');
      }
    });
  }

  //----------------END routes

  document.querySelector('#feedback button').addEventListener('click', e => {
    const message = document.querySelector('#feedback textarea').value;
    if (message.length === 0) { return }
    const feedback = `\n----------------FEEDBACK START ${ (new Date()).toISOString() }\n\n${ message }\n\n----------------FEEDBACK END\n`;
    socket.emit('feedback', feedback);
    alert('Grazie!');
    document.querySelector('#feedback textarea').value = '';
  });

  socket.on('disconnect', () => {
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.display = 'none';

    // alert('It appears you have a network problem.\nReconnecting...'); // TODO
  }); // socket.on('connect', ...)

  socket.on('connect', () => {
    document.documentElement.style.backgroundColor = 'initial';
    document.body.style.display = 'initial';

    socket.emit('route', ROUTE);
  }); // socket.on('connect', ...)


}); // document.addEventListener('DOMContentLoaded', ...)
