import { Button } from '@gouvfr-lasuite/cunningham-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, DropdownMenu, Icon } from '@/components';
import { useCreateDoc } from '@/docs/doc-management';
import { useSkeletonStore } from '@/features/skeletons';

import { useLeftPanelStore } from '../stores';

export const LeftPanelHeaderButton = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { closePanel } = useLeftPanelStore();
  const { setIsSkeletonVisible } = useSkeletonStore();
  const [isNavigating, setIsNavigating] = useState(false);

  const { mutate: createDoc, isPending: isDocCreating } = useCreateDoc({
    onSuccess: (doc) => {
      setIsNavigating(true);
      // Wait for navigation to complete
      router
        .push(`/docs/${doc.id}`)
        .then(() => {
          // The skeleton will be disabled by the [id] page once the data is loaded
          setIsNavigating(false);
          closePanel({ type: 'mobile' });
        })
        .catch(() => {
          // In case of navigation error, disable the skeleton
          setIsSkeletonVisible(false);
          setIsNavigating(false);
        });
    },
    onError: () => {
      // If there's an error, disable the skeleton
      setIsSkeletonVisible(false);
      setIsNavigating(false);
    },
  });

  const handleClick = () => {
    setIsSkeletonVisible(true);
    createDoc();
  };

  const handleImportNotion = () => {
    const baseApiUrl = process.env.NEXT_PUBLIC_API_ORIGIN;
    const notionAuthUrl = `${baseApiUrl}/api/v1.0/notion-import/redirect`;
    window.location.href = notionAuthUrl;
  };

  const isLoading = isDocCreating || isNavigating;

  return (
    <Box $direction="row" $align="center">
      <Button
        data-testid="new-doc-button"
        color="brand"
        onClick={handleClick}
        icon={<Icon $color="inherit" iconName="add" aria-hidden="true" />}
        disabled={isLoading}
      >
        {t('New doc')}
      </Button>
      <DropdownMenu
        showArrow
        disabled={isDocCreating}
        options={[
          {
            label: t('Import from Notion'),
            callback: handleImportNotion,
            padding: { vertical: 'xs', horizontal: 'md' },
          },
        ]}
      ></DropdownMenu>
    </Box>
  );
};
