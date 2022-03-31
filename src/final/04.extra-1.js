// Prop Collections and Getters
// 💯 prop getters
// http://localhost:3000/isolated/final/04.extra-1.js

import * as React from 'react'
import {Switch} from '../switch'

// `...fns` is get all its arguments (as FUNCTIONS)
const callAll =
	(...fns) =>
	// then for each argument (function), return their executed value with all the arguments (`...args`) that they take
	// `...args` is just for general purpose,
	// in this case, without the `...args` it still works
	// coz `toggle` and `() => console.info('onButtonClick')` receive no argument
	// `fn?.(...args)` so that it executes the `() => console.info('onButtonClick')` from the <button/> (if that's passed in), if there's no `?.` then if you clicked on the <Switch/>, as there's no `onClick` prop passed in, and it assumes there's an `onClick` function, it'll go and execute that non-existing function, causing the "TypeError: fn is not a function", but since the `toggle` is still a default return value from the `getTogglerProps()`, the <Switch/> still works if you click on the <button/>
	(...args) =>
		fns.forEach(fn => fn?.(...args))

function useToggle() {
	const [on, setOn] = React.useState(false)
	const toggle = () => setOn(!on)

	function getTogglerProps({onClick, ...props} = {}) {
		return {
			'aria-pressed': on,
			// in this case:
			// onClick: toggle() -- for the <Switch/>
			// onClick: (() => console.info('onButtonClick'))() -- for the <button/>
			onClick: callAll(onClick, toggle),
			// in this case:
			// `id: 'custom-button-id'` for the <button/>
			// destructured `{on}` for the <Switch/>
			...props,
		}
	}

	return {
		on,
		toggle,
		getTogglerProps,
	}
}

function App() {
	const {on, getTogglerProps} = useToggle()
	return (
		<div>
			<Switch {...getTogglerProps({on})} />
			<hr />
			<button
				{
					// spread to get all the returned props from the execution of getTogglerProps()
					...getTogglerProps({
						'aria-label': 'custom-button',
						onClick: () => console.info('onButtonClick'),
						id: 'custom-button-id',
					})
				}
			>
				{on ? 'on' : 'off'}
			</button>
		</div>
	)
}

export default App
