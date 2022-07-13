import React, { useState } from 'react';
import {
  Button,
  Box,
  FormGroup,
  Input,
  Label,
  Text,
} from '@admin-bro/design-system';
import { ApiClient, useNotice } from 'admin-bro';

const CreateAdmin = (props) => {
  const api = new ApiClient();
  const sendNotice = useNotice();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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
                            ? 'Admin Created SuccessFully'
                            : res.data.notice.message,
                      };
                      sendNotice(Notice);
                      setName('');
                      setEmail('');
                    });
                } else {
                  sendNotice({
                    message: 'Invite has already been sent for this email ID',
                    type: 'error',
                  });
                  setName('');
                  setEmail('');
                }
              });
          } else {
            const form_data = new FormData();

            const updatedData = {
              ...data.records[0].params,
              userType: 'admin',
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
                      ? 'Admin Created SuccessFully'
                      : res.data.notice.message,
                };
                sendNotice(Notice);
                setName('');
                setEmail('');
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
        CREATE ADMIN
      </Text>
      <FormGroup>
        <Label required>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Label mt="lg" required>
          Email
        </Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={handleCreate} color="white" bg="primary100" mt="xl">
          Create Admin
        </Button>
      </FormGroup>
    </Box>
  );
};
export default CreateAdmin;
