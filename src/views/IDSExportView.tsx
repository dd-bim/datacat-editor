import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { T } from '@tolgee/react';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
}));

const IDSExportView: React.FC = () => {
  return (
    <Container>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <T keyName="ids_export.title">Information Delivery Specification</T>
        </Typography>
      </Box>
    </Container>
  );
};

export default IDSExportView;
