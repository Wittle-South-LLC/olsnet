/* Admin.jsx - Administer users */

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Row, Table } from 'react-bootstrap'
import PanelHeader from '../components/PanelHeader'
import { intlShape, defineMessages } from 'react-intl'
import { deleteUser, editUserField, listUsers, updateUser } from '../state/user/userActions'
import { getUserById, USER_ROLES } from '../state/user/user'

export default class Admin extends React.Component {
  constructor (props, context) {
    super(props, context)

    // Searches for users
    this.onSubmit = this.onSubmit.bind(this)

    // Deletes a user
    this.onDeleteClick = this.onDeleteClick.bind(this)

    // Sets a role
    this.onSetRoleClick = this.onSetRoleClick.bind(this)

    // Updates search text
    this.onSearchChange = this.onSearchChange.bind(this)

    // Holds search text state
    this.state = {
      searchText: ''
    }

    this.componentText = defineMessages({
      adminHeader: { id: 'Admin.adminHeader', defaultMessage: 'Administer Users' },
      searchLabel: { id: 'Admin.searchLabel', defaultMessage: 'Search: ' },
      searchPlaceholder: { id: 'Admin.searchPlaceholder', defaultMessage: 'Enter username filter' },
      searchButtonText: { id: 'Admin.searchButtonText', defaultMessage: 'Search' },
      thUserName: { id: 'Admin.thUserName', defaultMessage: 'User Name' },
      thUserEmail: { id: 'Admin.thUserEmail', defaultMessage: 'User Email' },
      thAdminRole: { id: 'Admin.thAdminRole', defaultMessage: 'Admin' },
      thTemplateEditRole: { id: 'Admin.thTemplateEditRole', defaultMessage: 'Template Edit' },
      thInterviewEditRole: { id: 'Admin.thInterviewEditRole', defaultMessage: 'Interview Edit' }
    })
  }
  onDeleteClick (user, e) {
    this.context.dispatch(deleteUser(user))
  }
  onSearchChange (e) {
    this.setState({
      searchText: e.target.value
    })
  }
  onSetRoleClick (user, role, e) {
    let newUser = user.hasRole(role)
      ? user.updateField(USER_ROLES, user.getUserRoles().replace(', ' + role,'')).setDirty()
      : user.updateField(USER_ROLES, user.getUserRoles() + ', ' + role).setDirty()
    this.context.dispatch(updateUser(newUser))
  }
  onSubmit (e) {
    this.context.dispatch(listUsers(this.state.searchText))
    e.preventDefault()
  }
  render () {
    const formatMessage = this.context.intl.formatMessage
    const ctxt = this.componentText
    let user = this.context.reduxState.get('user')
    let userRows = user.has('list') && user.get('list') !== undefined
      ? user.get('list').map((user, i) => {
        return (
          <tr key={i}>
            <td>{user.getUserName()}</td>
            <td>{user.getUserEmail()}</td>
            <td><Checkbox id={'adminCheck_' + i} checked={user.hasRole('Admin')} 
                          onChange={this.onSetRoleClick.bind(undefined, user, 'Admin')} /></td>
            <td><Checkbox id={'templateEditCheck_' + i} checked={user.hasRole('TemplateEdit')}
                          onChange={this.onSetRoleClick.bind(undefined, user, 'TemplateEdit')} /></td>
            <td><Checkbox id={'interviewEditCheck_' + i} checked={user.hasRole('InterviewEdit')}
                          onChange={this.onSetRoleClick.bind(undefined, user, 'InterviewEdit')} /></td>
            <td><span id={'deleteLink_' + i} onClick={this.onDeleteClick.bind(undefined, user)}>DeleteMe</span></td>
          </tr>
        )})
      : []
    return (
      <Row>
        <div className='panel panel-default'>
          <PanelHeader>
            <span className='panelTitle'>{formatMessage(ctxt.adminHeader)}</span>
          </PanelHeader>
          <div className='panel-body'>
            <Form horizontal onSubmit={this.onSubmit} name='searchForm'>
              <FormGroup id='searchFG'>
                <Col componentClass={ControlLabel} md={2}>
                  {formatMessage(ctxt.searchLabel)}
                </Col>
                <Col md={2}>
                  <FormControl
                      type='text'
                      id='searchText'
                      placeholder={formatMessage(ctxt.searchPlaceholder)}
                      value={this.state.searchText}
                      onChange={this.onSearchChange}/>
                </Col>
                <Col md={2}>
                  <Button type='submit'>{formatMessage(ctxt.searchButtonText)}</Button>
                </Col>
              </FormGroup>
            </Form>
            <Table>
            <thead>
                <tr>
                <th>{formatMessage(ctxt.thUserName)}</th>
                <th>{formatMessage(ctxt.thUserEmail)}</th>
                <th>{formatMessage(ctxt.thAdminRole)}</th>
                <th>{formatMessage(ctxt.thTemplateEditRole)}</th>
                <th>{formatMessage(ctxt.thInterviewEditRole)}</th>
                </tr>
            </thead>
            <tbody>
                {userRows}
            </tbody>
            </Table>
          </div>
        </div>
      </Row>
    )
  }
}

Admin.contextTypes = {
  dispatch: PropTypes.func,
  intl: intlShape,
  reduxState: PropTypes.object.isRequired,
  router: PropTypes.object
}
