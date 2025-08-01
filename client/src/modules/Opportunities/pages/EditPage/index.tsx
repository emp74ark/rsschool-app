import React, { useContext, useEffect, useState } from 'react';
import { Layout, Modal, Typography } from 'antd';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import Head from 'next/head';
import { OpportunitiesApi, ResumeDto } from 'api';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { useLoading } from 'components/useLoading';
import { SessionContext } from 'modules/Course/contexts';
import { EditViewCv } from 'modules/Opportunities/components/EditViewCv';

const { Content } = Layout;
const { Text, Paragraph } = Typography;

const service = new OpportunitiesApi();

export function EditPage() {
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  const switchView = () => setEditMode(!editMode);

  useEffect(() => {
    getData();
  }, [editMode]);

  const getData = withLoading(async () => {
    const { data } = await service.getConsent();
    if (data.consent) {
      try {
        const { data } = await service.getResume(githubId);
        setResume(data);
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          setResume(null);
          return;
        }
        throw err;
      }
    }
    setConsent(data.consent);
  });

  const handleDeleteConsent = withLoading(async () => {
    const { data } = await service.deleteConsent();
    await getData();
    return data;
  });

  const showCreationModal = (validUntilTimestamp: number) => {
    const validUntil = dayjs(validUntilTimestamp).format('YY-MM-DD');

    const title = <Text strong>Your CV is now public until {validUntil} (for 1 month period from now on)</Text>;
    const content = (
      <>
        <Paragraph>You need to renew your CV every month.</Paragraph>
        <Paragraph>
          {' '}
          Otherwise it will not be shown to other RS App users.{' '}
          <a href="https://docs.app.rs.school/#/platform/cv" target="_blank" rel="noreferrer">
            Learn more about CV
          </a>
        </Paragraph>
      </>
    );

    modal.info({
      title,
      content,
      okText: 'Got it',
    });
  };

  const handleCreateConsent = withLoading(async () => {
    const { data } = await service.createConsent();
    await getData();
    showCreationModal(data.expires);
    setEditMode(true);
  });

  return (
    <>
      {contextHolder}
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading}>
        <Header title="My CV" />
        <Content className="print-no-padding" style={{ maxWidth: 960, margin: 'auto' }}>
          <EditViewCv
            githubId={githubId}
            consent={consent}
            data={resume}
            editMode={editMode || resume == null}
            switchView={switchView}
            onRemoveConsent={handleDeleteConsent}
            onCreateConsent={handleCreateConsent}
            onUpdateResume={() => getData()}
          />
        </Content>
      </LoadingScreen>
      <style jsx global>{`
        html,
        body {
          font-family: 'Ubuntu', sans-serif;
        }
      `}</style>
    </>
  );
}
