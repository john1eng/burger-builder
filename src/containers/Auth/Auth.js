import React, { Component } from 'react' 
import classes from './Auth.css'
import Input from '../../components/UI/Input/Input'
import Button from '../../components/UI/Button/Button'
import Spinner from '../../components/UI/Spinner/Spinner'
import { connect } from 'react-redux'
import { auth } from '../../store/actions/index'
import { Redirect } from 'react-router-dom'
import * as actions from '../../store/actions/index'
import { updateObject, checkValidity } from '../../shared/utility'

class Auth extends Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Your E-Mail'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                isTouched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Your Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 7
                },
                valid: false,
                isTouched: false
            },   
        }, 
        isSignup: true
    }

    componentDidMount(){
        if(!this.props.buildingBurger && this.props.authRedirectPath !== '/')
            this.props.onSetAuthRedirectPath()
    }

    inputChangedHandler = (event, controlName) => {
        const updateControlName = updateObject(this.state.controls[controlName],
            {
                value: event.target.value,
                valid: checkValidity(event.target.value, this.state.controls[controlName].validation),
                isTouched: true
            })
        const updateControl = updateObject(this.state.controls,
             {
                [controlName]: updateControlName
             })    
        this.setState({controls: updateControl})
        }

    submitHandler = (event) =>{
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup)
    }

    switchAuthHandler = () => {
        this.setState(prevState => {
            return {isSignup: !prevState.isSignup}
        })
    }

    render(){
        const formElementsArray = [];
        for(let key in this.state.controls){
            formElementsArray.push({
                id: key,
                config: this.state.controls[key]
            });
        }
        let form = 
                formElementsArray.map(formElement => (
                    <Input 
                        key={formElement.id}
                        elementType={formElement.config.elementType}
                        elementConfig={formElement.config.elementConfig} 
                        value={formElement.config.value}
                        invalid={!formElement.config.valid}
                        shouldValidate={formElement.config.validation} 
                        touched = {formElement.config.isTouched}
                        changed={(event) => this.inputChangedHandler(event, formElement.id)} />
                ))
        if(this.props.loading)
            form = <Spinner />   
        
        let errorMessage = null;
        
        if(this.props.error)
            errorMessage = <p>{this.props.error.message}</p>

        let redirect = null;
        
        if(this.props.isAuthenticated)
            redirect = <Redirect to={this.props.authRedirectPath} />

        return (
            <div className = {classes.Auth}>
            {redirect}
            <h4>Authentification</h4>
            {errorMessage}
            <div>
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success">SUBMIT</Button>
                </form>
                <Button clicked={this.switchAuthHandler} 
                            btnType="Danger">SWITCH TO {this.state.isSignup ? 'SIGN IN' : 'SIGN UP'}</Button>
            </div>
        </div>
        )
    
    }

}
const mapStateToProps = (state) => {
    return {
        loading:    state.auth.loading,
        error:      state.auth.error,
        isAuthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    }
}
const mapDispatchToProps = (dispatch) =>{
    return{
        onAuth: (email, password, mode) => dispatch(auth(email, password, mode)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth)