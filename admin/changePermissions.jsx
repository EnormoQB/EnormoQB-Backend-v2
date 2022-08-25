import React, { useState } from 'react';
import {
  Button,
  Box,
  FormGroup,
  Input,
  Label,
  Text,
  Radio,
} from '@admin-bro/design-system';
import { ApiClient, useNotice } from 'admin-bro';

const CreateAdmin = (props) => {
  const api = new ApiClient();
  const sendNotice = useNotice();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('exam-setter');

  const handleCreate = () => {
    try {
      if (!name || !email) return;

      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        sendNotice({
          message: 'Please enter a valid email',
          type: 'error',
        });
        return;
      }

      api
        .resourceAction({
          resourceId: 'User',
          actionName: 'list',
          params: {
            'filters.email': email,
            page: 1,
          },
        })
        .then(({ data }) => {
          if (data.records.length === 0) {
            api
              .resourceAction({
                resourceId: 'Pending Invites',
                actionName: 'list',
                params: {
                  'filters.email': email,
                  page: 1,
                },
              })
              .then(({ data: listData }) => {
                if (listData.records.length === 0) {
                  const data = new FormData();
                  data.append('name', name);
                  data.append('email', email);
                  data.append('role', role);
                  api
                    .resourceAction({
                      resourceId: 'Pending Invites',
                      actionName: 'new',
                      data,
                    })
                    .then((res) => {
                      const Notice = {
                        ...res.data.notice,
                        message:
                          res.data.notice.type === 'success'
                            ? 'Permissions Changed SuccessFully'
                            : res.data.notice.message,
                      };
                      sendNotice(Notice);
                      setName('');
                      setEmail('');
                      setRole('exam-setter');
                    });
                } else {
                  sendNotice({
                    message: 'Invite has already been sent for this email ID',
                    type: 'error',
                  });
                  setName('');
                  setEmail('');
                  setRole('exam-setter');
                }
              });
          } else {
            const form_data = new FormData();

            const updatedData = {
              ...data.records[0].params,
              userType: role,
              typeLastChanged: new Date(),
            };
            for (var key in updatedData) {
              form_data.append(key, updatedData[key]);
            }
            api
              .recordAction({
                resourceId: 'User',
                recordId: data.records[0].params._id,
                actionName: 'edit',
                data: form_data,
              })
              .then((res) => {
                const Notice = {
                  ...res.data.notice,
                  message:
                    res.data.notice.type === 'success'
                      ? 'Permissions Changed SuccessFully'
                      : res.data.notice.message,
                };
                sendNotice(Notice);
                setName('');
                setEmail('');
                setRole('exam-setter');
              });
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Box width={1 / 2} p="xl">
      <Text fontSize="h4" fontWeight="bold" mb="lg">
        CHANGE PERMISSIONS
      </Text>
      <FormGroup>
        <Label required>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Label mt="lg" required>
          Email
        </Label>
        <Input
          mb="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label mt="sm" required>
          Role
        </Label>
        <Box mt="sm" flex>
          <Box flexDirection="column" marginRight={15}>
            <Radio
              onChange={() => setRole('exam-setter')}
              id="setter"
              checked={role === 'exam-setter'}
            />
            <Label inline htmlFor="setter" ml="default">
              Exam Setter
            </Label>
          </Box>
          <Box flexDirection="column" marginRight={15}>
            <Radio
              onChange={() => setRole('reviewer')}
              id="reviewer"
              checked={role === 'reviewer'}
            />
            <Label inline htmlFor="reviewer" ml="default">
              Reviewer
            </Label>
          </Box>
          <Box flexDirection="column" marginRight={15}>
            <Radio
              onChange={() => setRole('contributor')}
              id="contributor"
              checked={role === 'contributor'}
            />
            <Label inline htmlFor="contributor" ml="default">
              Contributor
            </Label>
          </Box>
        </Box>
        <Button onClick={handleCreate} color="white" bg="primary100" mt="xl">
          Change Permissions
        </Button>
      </FormGroup>
    </Box>
  );
};
export default CreateAdmin;
