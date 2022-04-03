import * as React from 'react'
import {useControlPropWarnings} from '../../utils'
import {Switch} from '../../switch'

// Using `unknown` type so that later we pass in the params whose type is defined
function callAll<Args extends Array<unknown>>(
	...fns: Array<((...args: Args) => unknown) | undefined>
) {
	return (...args: Args) => fns.forEach(fn => fn?.(...args))
}

type ToggleState = {on: boolean}
type ToggleAction =
	| {type: 'toggle'}
	| {type: 'reset'; initialState: ToggleState}

function toggleReducer(state: ToggleState, action: ToggleAction) {
	switch (action.type) {
		case 'toggle': {
			return {on: !state.on}
		}
		case 'reset': {
			return action.initialState
		}
	}
}

function useToggle({
	initialOn = false,
	reducer = toggleReducer,
	onChange,
	on: controlledOn,
}: {
	initialOn?: boolean
	reducer?: typeof toggleReducer
	onChange?: (state: ToggleState, action: ToggleAction) => void
	on?: boolean
} = {}) {
	// Adding a generic <ToggleState> to `useRef` to explicitly set its param's type
	const {current: initialState} = React.useRef<ToggleState>({on: initialOn})
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const onIsControlled = controlledOn != null
	const on = onIsControlled ? controlledOn : state.on

	function dispatchWithOnChange(action: ToggleAction) {
		if (!onIsControlled) {
			dispatch(action)
		}
		onChange?.(reducer({...state, on}, action), action)
	}

	const toggle = () => dispatchWithOnChange({type: 'toggle'})
	const reset = () => dispatchWithOnChange({type: 'reset', initialState})

	function getTogglerProps<Props>({
		onClick,
		...props
	}: {onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']} & Props) {
		return {
			'aria-pressed': on,
			onClick: callAll(onClick, toggle),
			...props,
		}
	}

	// A generic <Props> means that it'll evaluates to whatever type the `...props` are
	// If you didn't declare the generic then it wouldn't know what's that `Props` from the ` & Props` is
	function getResetterProps<Props>({
		onClick,
		...props
	}: {onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']} & Props) {
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

function Toggle({
	on: controlledOn,
	onChange,
	readOnly,
}: {
	on?: boolean
	onChange?: (state: ToggleState, action: ToggleAction) => void
	readOnly?: boolean
}) {
	useControlPropWarnings({
		readOnly,
		controlPropValue: controlledOn,
		hasOnChange: Boolean(onChange),
		controlPropName: 'on',
		componentName: 'Toggle',
		readOnlyProp: 'readOnly',
		initialValueProp: 'initialOn',
		onChangeProp: 'onChange',
	})

	const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
	const props = getTogglerProps({on})
	return <Switch {...props} />
}

function App() {
	const [bothOn, setBothOn] = React.useState(false)
	const [timesClicked, setTimesClicked] = React.useState(0)

	function handleToggleChange(state: ToggleState, action: ToggleAction) {
		if (action.type === 'toggle' && timesClicked > 4) {
			return
		}
		setBothOn(state.on)
		setTimesClicked(c => c + 1)
	}

	function handleResetClick() {
		setBothOn(false)
		setTimesClicked(0)
	}

	return (
		<div>
			<div>
				<Toggle on={bothOn} onChange={handleToggleChange} />
				<Toggle on={bothOn} onChange={handleToggleChange} />
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
  no-unused-expressions: "off",
*/
