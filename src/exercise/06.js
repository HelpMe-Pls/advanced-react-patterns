// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {Switch} from '../switch'
import warning from 'warning' // implementation: warning(false, 'Log this')

const callAll =
	(...fns) =>
	(...args) =>
		fns.forEach(fn => fn?.(...args))

const actionTypes = {
	toggle: 'toggle',
	reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
	switch (type) {
		case actionTypes.toggle: {
			return {on: !state.on}
		}
		case actionTypes.reset: {
			return initialState
		}
		default: {
			throw new Error(`Unsupported type: ${type}`)
		}
	}
}

// For an IDEAL & GENERIC implementation, checkout `final/TS/06.tsx`
function useControlledSwitchWarning({isOn, onChange, readOnly = false}) {
	const onIsControlled = isOn != null
	// Logs a warning for when the user changes from controlled to uncontrolled or vice-versa
	// To see how this works at 01:10 from https://epicreact.dev/modules/advanced-react-patterns/control-props-extra-credit-solution-2
	const {current: onWasControlled} = React.useRef(onIsControlled)
	React.useEffect(() => {
		warning(
			!(!onWasControlled && onIsControlled),
			`\`useToggle\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`useToggle\` for the lifetime of the component. Check the \`on\` prop.`,
		)
		warning(
			!(onWasControlled && !onIsControlled),
			`\`useToggle\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`useToggle\` for the lifetime of the component. Check the \`on\` prop.`,
		)
	}, [onIsControlled, onWasControlled])

	// Passing `isOn` without `onChange`:
	// To see how this works at 03:20 from https://epicreact.dev/modules/advanced-react-patterns/control-props-extra-credit-solution-1
	const hasOnChange = !!onChange
	React.useEffect(() => {
		warning(
			!(!hasOnChange && onIsControlled && !readOnly),
			`An \`on\` prop was provided to useToggle without an \`onChange\` handler. This will render a read-only toggle. If you want it to be mutable, use \`initialOn\`. Otherwise, set either \`onChange\` or \`readOnly\`.`,
		)
	}, [hasOnChange, onIsControlled, readOnly])
}

function useToggle({
	initialOn = false,
	reducer = toggleReducer,
	// 💰 you can alias it to `controlledOn` to avoid "variable shadowing."
	// on: controlledOn,
	readOnly = false,
	isOn,
	onChange,
} = {}) {
	const {current: initialState} = React.useRef({on: initialOn})
	const [state, dispatch] = React.useReducer(reducer, initialState)
	if (process.env.NODE_ENV !== 'production')
		// `process.env.NODE_ENV` is guaranteed to NEVER change during the lifetime of the app when it's deployed, therefore, it's OK to:
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useControlledSwitchWarning({isOn, onChange, readOnly})

	// Use `controlledOn` instead of `isOn` if you decided to use the <Toggle/> with `on` prop. We're using `isOn` prop so that's how it goes
	// 🐨 determine whether the `on` property of the state is controlled (i.e. `isOn` prop is passed to <Toggle/>) by assign that to `onIsControlled`
	// 💰  `== null` is true for `null` and `undefined`
	// therefore, `isOn != null` means if `isOn` is not `null` OR `undefined`
	const onIsControlled = isOn != null

	// 🐨 Replace the next line with assigning `on` to `isOn` if
	// `onIsControlled`, otherwise, it should be `state.on`.
	// const {on} = state
	const on = onIsControlled ? isOn : state.on

	// We want to call `onChange` any time we need to make a state change, but we
	// only want to call `dispatch` if `!onIsControlled` (otherwise we could get
	// unnecessary renders).
	// 🐨 To simplify things a bit, let's make a `dispatchWithOnChange` function
	// right here. This will:
	// 1. accept an action
	// 2. if onIsControlled is false, call dispatch with that action
	// 3. Then call `onChange` with our "suggested changes" and the action.

	// 🦉 "Suggested changes" refers to: the changes we would make if we were
	// managing the state ourselves. This is similar to how a controlled <input />
	// `onChange` callback works. When your handler is called, you get an event
	// which has information about the value input that _would_ be set to if that
	// state were managed internally.
	// So how do we determine our suggested changes? What code do we have to
	// calculate the changes based on the `action` we have here? That's right!
	// The reducer! So if we pass it the current state and the action, then it
	// should return these "suggested changes!"

	// 💰 Also note that users don't *have* to pass an `onChange` prop (it's not required)
	// so keep that in mind when you call it! How could you avoid calling it if it's not passed? By using `?.` we can avoid the "TypeError: onChange is not a function" if we don't pass `onChange` prop when we use the <Toggle/>
	const dispatchWithOnChange = action => {
		// if we don't check `if (!onIsControlled)` and just straight up call `dispatch(action)` then it would trigger unnecessary re-renders of our controlled <Toggle/>
		if (!onIsControlled) dispatch(action)

		// {...state,on} creates a new state shape with the "controlled" properties (in this case, the `on` property, which could either be `on: bothOn` or just the default `on: state.on` if the <Toggle/> is "uncontrolled")
		const newState = reducer({...state, on}, action)
		onChange?.(newState, action)
	}

	// make these call `dispatchWithOnChange` instead
	// const toggle = () => dispatch({type: actionTypes.toggle})
	// const reset = () => dispatch({type: actionTypes.reset, initialState})
	const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
	const reset = () =>
		dispatchWithOnChange({type: actionTypes.reset, initialState})

	function getTogglerProps({onClick, ...props} = {}) {
		return {
			'aria-pressed': on,
			onClick: callAll(onClick, toggle),
			...props,
		}
	}

	function getResetterProps({onClick, ...props} = {}) {
		return {
			onClick: callAll(onClick, reset),
			...props,
		}
	}

	return {
		on,
		reset,
		toggle,
		getTogglerProps,
		getResetterProps,
	}
}

function Toggle({isOn, onChange, readOnly}) {
	const {on, getTogglerProps} = useToggle({isOn, onChange, readOnly})
	const props = getTogglerProps({on})
	return <Switch {...props} />
}

function App() {
	const [bothOn, setBothOn] = React.useState(false)
	const [timesClicked, setTimesClicked] = React.useState(0)

	// `state` here is now the `newState` in the `dispatchWithOnChange` function from the `useToggle` hook
	function handleToggleChange(state, action) {
		if (action.type === actionTypes.toggle && timesClicked > 4) {
			return
		}
		setBothOn(state.on)
		setTimesClicked(count => count + 1)
	}

	function handleResetClick() {
		setBothOn(false)
		setTimesClicked(0)
	}

	return (
		<div>
			<div>
				{/* the state is now has a controlled `on` prop: 
				state = {
					on: bothOn
				}
				*/}
				<Toggle isOn={bothOn} onChange={handleToggleChange} />
				<Toggle isOn={bothOn} onChange={handleToggleChange} />
			</div>
			{timesClicked > 4 ? (
				<div data-testid="notice">
					Whoa, you clicked too much!
					<br />
				</div>
			) : (
				<div data-testid="click-count">Click count: {timesClicked}</div>
			)}
			<button onClick={handleResetClick}>Reset</button>
			<hr />
			<div>
				<div>Uncontrolled Toggle:</div>
				<Toggle
					// uncontrolled `on` is handled by the default `state.on`
					// Uncontrolled `on` property of the state, i.e:
					// state = {
					//		on: true | false (initialized by the `initialState` from the `useToggle` hook definition)
					// }
					// `...arg` is the `state` and `action`
					onChange={(...args) =>
						console.info('Uncontrolled Toggle onChange', ...args)
					}
				/>
			</div>
		</div>
	)
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
