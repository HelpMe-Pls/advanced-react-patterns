// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {Switch} from '../switch'

function Toggle({children}) {
	const [on, setOn] = React.useState(false)
	const toggle = () => setOn(!on)

	// 🐨 replace this with a call to React.Children.map and map each child in
	// props.children to a clone of that child with the props they need using
	// React.cloneElement:
	// 📜 At 3:45 from https://epicreact.dev/modules/advanced-react-patterns/compound-components-solution
	// 💰 React.Children.map(props.children, child => {/* return child clone here */})
	// 📜 At 2:30

	return React.Children.map(children, child => {
		return typeof child.type === 'string' // 📜 At 2:30 from https://epicreact.dev/modules/advanced-react-patterns/compound-components-extra-credit-solution-1
			? child
			: React.cloneElement(child, {on, toggle})
	})
}

// 🐨 Flesh out each of these components

// Accepts `on` and `children` props and returns `children` if `on` is true
const ToggleOn = ({on, children}) => (on ? children : null)

// Accepts `on` and `children` props and returns `children` if `on` is false
const ToggleOff = ({on, children}) => (on ? null : children)

// Accepts `on` and `toggle` props and returns the <Switch /> with those props.
const ToggleButton = ({on, toggle}) => <Switch on={on} onClick={toggle} />

function App() {
	return (
		<div>
			<Toggle>
				<ToggleOn>The button is on</ToggleOn>
				<ToggleOff>The button is off</ToggleOff>
				<p>It is what it is</p>
				<ToggleButton />
			</Toggle>
		</div>
	)
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
