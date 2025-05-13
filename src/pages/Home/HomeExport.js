import GroupChatIdProvider from '../../Contexts/groupChatIdContext';

function HomeExport({child}) {
  return (
    <GroupChatIdProvider>
      {child}
    </GroupChatIdProvider>
  );
}

export default HomeExport;