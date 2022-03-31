// Prop Collections and Getters
// http://localhost:3000/isolated/exercise/04.js
// Checkout '../final/04.extra-1' for the solution of Extra Credit

import * as React from 'react'
import {Switch} from '../switch'
function useToggle() {
	const [on, setOn] = React.useState(false)
	const toggle = () => setOn(!on)

	// 🐨 Add a property called `togglerProps`. It should be an object that has
	// `aria-pressed` and `onClick` properties.
	// 💰 {'aria-pressed': on, onClick: toggle}
	const getTogglerProps = props => {
		return {
			'aria-pressed': on,
			onClick: toggle,
			...props,
		}
	}

	return {on, toggle, getTogglerProps}
}

function App() {
	const {on, getTogglerProps} = useToggle()
	return (
		<div>
			<Switch {...getTogglerProps({on})} />
			<hr />
			<button
				{...getTogglerProps({
					'aria-label': 'custom-button',
					onClick: () => console.info('onButtonClick'),
					id: 'custom-button-id',
				})}
			>
				{on ? 'Turn it off' : 'Turn it on'}
			</button>
		</div>
	)
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
